import Map "mo:core/Map";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type MigratedActor = {
    nextReelId : Nat;
    userProfiles : Map.Map<Principal, MigratedUserProfile>;
    reels : Map.Map<Nat, MigratedReel>;
    followersMap : Map.Map<Principal, List.List<Principal>>;
    followingMap : Map.Map<Principal, List.List<Principal>>;
  };

  type MigratedUserProfile = {
    username : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type MigratedReel = {
    id : Nat;
    uploader : Principal;
    video : Storage.ExternalBlob;
    description : Text;
  };

  type OldActor = {
    nextReelId : Nat;
    userProfiles : Map.Map<Principal, MigratedUserProfile>;
    reels : Map.Map<Nat, MigratedReel>;
    // No followers or following maps in old actor
    profanityList : [Text];
  };

  public func run(old : OldActor) : MigratedActor {
    {
      old with
      followersMap = Map.empty<Principal, List.List<Principal>>();
      followingMap = Map.empty<Principal, List.List<Principal>>();
    };
  };
};
