import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";
import Text "mo:core/Text";

(with migration = Migration.run)
actor {
  // Include storage system for blobs and files
  include MixinStorage();
  // Include authorization/role management system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ProfanityMap = [Text];
  var profanityMap : ProfanityMap = [];

  // Profanity filter
  func buildProfanityMap(words : [Text]) {
    profanityMap := words;
  };

  func isProfane(text : Text) : Bool {
    for (word in profanityMap.values()) {
      if (text.contains(#text(word))) {
        return true;
      };
    };
    false;
  };

  // User profile type
  public type UserProfile = {
    username : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Reel type
  public type Reel = {
    id : Nat;
    uploader : Principal;
    video : Storage.ExternalBlob;
    description : Text;
  };

  type Followers = List.List<Principal>;
  type Following = List.List<Principal>;
  module Reel {
    public func compare(reel1 : Reel, reel2 : Reel) : Order.Order {
      Int.compare(reel2.id, reel1.id);
    };
  };

  var reels = Map.empty<Nat, Reel>();
  var nextReelId = 0;
  var followersMap = Map.empty<Principal, Followers>();
  var followingMap = Map.empty<Principal, Following>();

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (isProfane(profile.bio)) {
      Runtime.trap("Inappropriate language detected in bio. Please remove any profanity.");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func uploadReel(video : Storage.ExternalBlob, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload reels");
    };
    if (isProfane(description)) {
      Runtime.trap("Inappropriate language detected in description. Please remove any profanity.");
    };
    let reelId = nextReelId;
    let reel : Reel = {
      id = reelId;
      uploader = caller;
      video;
      description;
    };
    reels.add(reelId, reel);
    nextReelId += 1;
    reelId;
  };

  public query ({ caller }) func getReel(id : Nat) : async Reel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    switch (reels.get(id)) {
      case (null) { Runtime.trap("Reel not found") };
      case (?reel) { reel };
    };
  };

  public query ({ caller }) func getAllReels() : async [Reel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    reels.values().toArray().sort();
  };

  public query ({ caller }) func getReelsByUploader(uploader : Principal) : async [Reel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    let filteredReels = reels.values().filter(
      func(reel) {
        reel.uploader == uploader;
      }
    );
    filteredReels.toArray().sort();
  };

  public shared ({ caller }) func followUser(userToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == userToFollow) {
      Runtime.trap("You cannot follow yourself");
    };

    let currentFollowers = switch (followersMap.get(userToFollow)) {
      case (null) { List.empty<Principal>() };
      case (?followers) { followers };
    };

    let currentFollowing = switch (followingMap.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?following) { following };
    };

    if (currentFollowers.contains(caller)) {
      Runtime.trap("You are already following this user");
    };

    currentFollowers.add(caller);
    currentFollowing.add(userToFollow);

    followersMap.add(userToFollow, currentFollowers);
    followingMap.add(caller, currentFollowing);
  };

  public shared ({ caller }) func unfollowUser(userToUnfollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    let currentFollowers = switch (followersMap.get(userToUnfollow)) {
      case (null) { List.empty<Principal>() };
      case (?followers) { followers };
    };

    let currentFollowing = switch (followingMap.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?following) { following };
    };

    if (not currentFollowers.contains(caller)) {
      Runtime.trap("You are not following this user");
    };

    let filteredFollowers = List.empty<Principal>();
    for (follower in currentFollowers.values()) {
      if (follower != caller) {
        filteredFollowers.add(follower);
      };
    };

    let filteredFollowing = List.empty<Principal>();
    for (following in currentFollowing.values()) {
      if (following != userToUnfollow) {
        filteredFollowing.add(following);
      };
    };

    followersMap.add(userToUnfollow, filteredFollowers);
    followingMap.add(caller, filteredFollowing);
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };
    switch (followersMap.get(user)) {
      case (null) { [] };
      case (?followers) { followers.toArray() };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following list");
    };
    switch (followingMap.get(user)) {
      case (null) { [] };
      case (?following) { following.toArray() };
    };
  };

  public query ({ caller }) func getFollowerCount(user : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view follower count");
    };
    switch (followersMap.get(user)) {
      case (null) { 0 };
      case (?followers) { followers.size() };
    };
  };

  public query ({ caller }) func getFollowingCount(user : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following count");
    };
    switch (followingMap.get(user)) {
      case (null) { 0 };
      case (?following) { following.size() };
    };
  };

  public query ({ caller }) func getFeed() : async [Reel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feed");
    };

    let following = switch (followingMap.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?following) { following };
    };

    let followedReels = List.empty<Reel>();
    let nonFollowedReels = List.empty<Reel>();

    for (reel in reels.values()) {
      if (following.contains(reel.uploader)) {
        followedReels.add(reel);
      } else {
        nonFollowedReels.add(reel);
      };
    };

    let followedArray = followedReels.toArray().sort();
    let nonFollowedArray = nonFollowedReels.toArray().sort();

    followedArray.concat(
      nonFollowedArray
    );
  };

  // Actor initialization
  system func preupgrade() {
    // No action needed, data is already persistent.
  };

  system func postupgrade() {
    buildProfanityMap([
      "fuck",
      "shit",
      "bitch",
      "asshole",
      "cunt",
      "dick",
      "bastard",
      "damn",
      "crap",
      "piss",
      "cock",
      "fag",
      "slut",
      "prick",
      "twat",
      "wanker",
      "bugger",
      "bollocks",
      "arse",
      "bloody",
      "shag",
      "tosser",
      "pillock",
      "bollocks",
      "bollox",
      "wank",
      "knob",
      "willy",
      "git",
      "minger",
      "bellend",
      "numpty",
      "bugger",
      "plonker",
      "banter",
      "blighter",
      "git",
      "numpty",
      "quim",
      "berk",
      "smeghead",
      "ponce",
      "pratt",
      "div",
      "git",
      "muppet",
      "spaz",
      "pillock",
      "muppetry",
      "munter",
      "naff",
      "plonker",
      "scrubber",
      "tosspot",
      "whinge",
      "tosspot",
      "wally",
      "wazzock",
      "bellend",
      "berk",
      "blighter",
      "bloody",
      "bollocks",
      "bonk",
      "bugger",
      "chav",
      "cock",
      "crikey",
      "dosh",
      "fag",
      "fit",
      "gobsmacked",
      "grotty",
      "knackered",
      "lad",
      "lush",
      "manky",
      "mental",
      "minted",
      "nitwit",
      "nonce",
      "pants",
      "peckish",
      "piss",
      "posh",
      "poxy",
      "prat",
      "quid",
      "shag",
      "skint",
      "snog",
      "sod",
      "spanner",
      "spaz",
      "suss",
      "tat",
      "tosser",
      "twat",
      "wanker",
      "wazzock",
      "wee",
      "whinge",
      "wonky",
      "yonks",
      "arsehole",
      "bollocks",
      "bugger",
      "bint",
      "bloody",
      "bollocks",
      "cock",
      "crikey",
      "dosh",
      "fag",
      "fit",
      "gobsmacked",
      "grotty",
      "knackered",
      "lad",
      "lush",
      "manky",
      "mental",
      "minted",
      "nitwit",
      "nonce",
      "pants",
      "peckish",
      "piss",
      "posh",
      "poxy",
      "prat",
      "quid",
      "shag",
      "skint",
      "snog",
      "sod",
      "spanner",
      "spaz",
      "suss",
      "tat",
      "tosser",
      "twat",
      "wanker",
      "wazzock",
      "wee",
      "whinge",
      "wonky",
      "yonks",
      "bint",
      "bloody",
      "bollocks",
      "bonk",
      "bugger",
      "chav",
      "cock",
      "crikey",
      "dosh",
      "fag",
      "fit",
      "gobsmacked",
      "grotty",
      "knackered",
      "lad",
      "lush",
      "manky",
      "mental",
      "minted",
      "nitwit",
      "nonce",
      "pants",
      "peckish",
      "piss",
      "posh",
      "poxy",
      "prat",
      "quid",
      "shag",
      "skint",
      "snog",
      "sod",
      "spanner",
      "spaz",
      "suss",
      "tat",
      "tosser",
      "twat",
      "wanker",
      "wazzock",
      "wee",
      "whinge",
      "wonky",
      "yonks",
      "arsehole",
      "bollocks",
      "bugger",
      "cobblers",
      "crikey",
      "dosh",
      "fag",
      "fit",
      "gobsmacked",
      "grotty",
      "knackered",
      "lad",
      "lush",
      "manky",
      "mental",
      "minted",
      "nitwit",
      "nonce",
      "pants",
      "peckish",
      "piss",
      "posh",
      "poxy",
      "prat",
      "quid",
      "shag",
      "skint",
      "snog",
      "sod",
      "spanner",
      "spaz",
      "suss",
      "tat",
      "tosser",
      "twat",
      "wanker",
      "wazzock",
      "wee",
      "whinge",
      "wonky",
      "yonks",
      "bollocks",
      "chuffed",
      "knob",
      "nob",
    ]);
  };
};
