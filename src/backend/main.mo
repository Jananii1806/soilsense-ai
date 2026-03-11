import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  type SoilParameters = {
    pH : Float;
    leadPPM : Float;
    cadmiumPPM : Float;
    arsenicPPM : Float;
    nickelPPM : Float;
    zincPPM : Float;
    chromiumPPM : Float;
    organicMatterPercentage : Float;
    nitrogenPPM : Float;
    phosphorusPPM : Float;
  };

  type SoilAnalysisRecord = {
    id : Nat;
    parameters : SoilParameters;
    recommendedPlant : Text;
    remediationCycles : Int;
    confidenceScore : Float;
    timestamp : Int;
    owner : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  module SoilAnalysisRecord {
    public func compare(a : SoilAnalysisRecord, b : SoilAnalysisRecord) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  let records = Map.empty<Nat, SoilAnalysisRecord>();
  var currentId = 0;
  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  public func createSoilAnalysisRecord(parameters : SoilParameters, recommendedPlant : Text, remediationCycles : Int, confidenceScore : Float, owner : Principal) : async SoilAnalysisRecord {
    {
      id = currentId;
      parameters;
      recommendedPlant;
      remediationCycles;
      confidenceScore;
      timestamp = Time.now();
      owner;
    };
  };

  public shared ({ caller }) func saveAnalysis(parameters : SoilParameters, recommendedPlant : Text, remediationCycles : Int, confidenceScore : Float) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save analyses");
    };

    let record = await createSoilAnalysisRecord(parameters, recommendedPlant, remediationCycles, confidenceScore, caller);
    records.add(currentId, record);
    currentId += 1;
    record.id;
  };

  public query ({ caller }) func getAnalysisHistory() : async [SoilAnalysisRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their history");
    };

    records.values().toArray().filter(func(record) { record.owner == caller });
  };

  public query ({ caller }) func getAnalysis(recordId : Nat) : async SoilAnalysisRecord {
    switch (records.get(recordId)) {
      case (?record) {
        if (record.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this record");
        };
        record;
      };
      case (null) { Runtime.trap("Record not found") };
    };
  };

  public shared ({ caller }) func deleteAnalysis(recordId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete analyses");
    };

    switch (records.get(recordId)) {
      case (?record) {
        if (record.owner != caller) {
          Runtime.trap("Unauthorized: You do not own this record");
        };
        records.remove(recordId);
      };
      case (null) { Runtime.trap("Record not found") };
    };
  };

  public query ({ caller }) func getAllRecords() : async [SoilAnalysisRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all records");
    };
    records.values().toArray();
  };

  public query ({ caller }) func getRecordCount() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view record count");
    };
    records.size();
  };
};
