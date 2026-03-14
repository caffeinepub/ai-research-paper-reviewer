import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Paper {
    public func compare(paper1 : Paper, paper2 : Paper) : Order.Order {
      Text.compare(paper1.title, paper2.title);
    };
  };

  module PaperResult {
    public func compare(result1 : PaperResult, result2 : PaperResult) : Order.Order {
      result1.id.compare(result2.id);
    };
  };

  type Paper = {
    id : Text;
    title : Text;
    filename : Text;
    blobId : Storage.ExternalBlob;
    uploadedAt : Time.Time;
    userId : Principal;
    status : Status;
  };

  type Status = {
    #uploaded;
    #analyzing;
    #reviewed;
    #pendingReview;
    #approved;
    #rejected;
    #accepted;
  };

  type PaperResult = {
    id : Text;
    paperId : Text;
    overallScore : Nat16;
    noveltyScore : Nat16;
    methodologyScore : Nat16;
    experimentScore : Nat16;
    citationScore : Nat16;
    reproducibilityScore : Nat16;
    clarityScore : Nat16;
    recommendation : Recommendation;
    acceptanceProbability : Nat16;
    strengths : [Text];
    weaknesses : [Text];
    suggestedImprovements : [Text];
    weakSections : [Text];
    researchGaps : [Text];
    rawReport : Text;
    submittedAt : Time.Time;
  };

  type Recommendation = {
    #strongAccept;
    #accept;
    #weakAccept;
    #borderline;
    #weakReject;
    #reject;
    #strongReject;
  };

  public type UserProfile = {
    name : Text;
  };

  let papers = Map.empty<Text, Paper>();
  let results = Map.empty<Text, PaperResult>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Paper Management
  public shared ({ caller }) func addPaper(id : Text, title : Text, filename : Text, blobId : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add papers");
    };
    let paper : Paper = {
      id;
      title;
      filename;
      blobId;
      uploadedAt = Time.now();
      userId = caller;
      status = #uploaded;
    };
    papers.add(id, paper);
  };

  public shared ({ caller }) func updatePaperStatus(id : Text, status : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update paper status");
    };
    switch (papers.get(id)) {
      case (null) { Runtime.trap("Paper not found") };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own papers");
        };
        papers.add(id, { paper with status });
      };
    };
  };

  public shared ({ caller }) func addPaperResult(result : PaperResult) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add paper results");
    };
    results.add(result.id, result);
    switch (papers.get(result.paperId)) {
      case (null) { () };
      case (?paper) {
        papers.add(result.paperId, { paper with status = #reviewed });
      };
    };
  };

  public query ({ caller }) func getPaper(id : Text) : async ?Paper {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view papers");
    };
    switch (papers.get(id)) {
      case (null) { null };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own papers");
        };
        ?paper;
      };
    };
  };

  public query ({ caller }) func getPapersByUser(userId : Principal) : async [Paper] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view papers");
    };
    if (userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own papers");
    };
    papers.values().toArray().filter(func(p) { p.userId == userId }).sort();
  };

  public query ({ caller }) func getPaperResult(id : Text) : async ?PaperResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view paper results");
    };
    switch (results.get(id)) {
      case (null) { null };
      case (?result) {
        switch (papers.get(result.paperId)) {
          case (null) { null };
          case (?paper) {
            if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view results for your own papers");
            };
            ?result;
          };
        };
      };
    };
  };

  public query ({ caller }) func getPaperResultsForPaper(paperId : Text) : async [PaperResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view paper results");
    };
    switch (papers.get(paperId)) {
      case (null) { Runtime.trap("Paper not found") };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view results for your own papers");
        };
        results.values().toArray().filter(func(r) { r.paperId == paperId }).sort();
      };
    };
  };

  public query ({ caller }) func getAllPapers() : async [Paper] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all papers");
    };
    papers.values().toArray().sort();
  };

  public query ({ caller }) func getAllPaperResults() : async [PaperResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all paper results");
    };
    results.values().toArray().sort();
  };

  public query ({ caller }) func getPapersByStatus(status : Status) : async [Paper] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view papers by status");
    };
    papers.values().toArray().filter(func(p) { p.status == status }).sort();
  };

  public shared ({ caller }) func getPaperStatus(paperId : Text) : async ?Status {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view paper status");
    };
    switch (papers.get(paperId)) {
      case (null) { null };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view status for your own papers");
        };
        ?paper.status;
      };
    };
  };

  public shared ({ caller }) func getStatus(paperId : Text) : async ?Status {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view paper status");
    };
    switch (papers.get(paperId)) {
      case (null) { null };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view status for your own papers");
        };
        ?paper.status;
      };
    };
  };

  public shared ({ caller }) func setPaperStatus(paperId : Text, status : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set paper status");
    };
    switch (papers.get(paperId)) {
      case (null) { () };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only set status for your own papers");
        };
        papers.add(paperId, { paper with status });
      };
    };
  };

  public shared ({ caller }) func setStatus(paperId : Text, status : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set paper status");
    };
    switch (papers.get(paperId)) {
      case (null) { () };
      case (?paper) {
        if (paper.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only set status for your own papers");
        };
        papers.add(paperId, { paper with status });
      };
    };
  };
};
