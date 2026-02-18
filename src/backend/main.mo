import Map "mo:core/Map";
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

  // Profanity filter
  let profanityList = [
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
  ];

  type ProfanityMap = [Text];

  var profanityMap : ProfanityMap = [];

  // Function to build the profanity map on initialization
  func buildProfanityMap(words : [Text]) {
    profanityMap := words;
  };

  // Initialize the profanity map on actor initialization
  buildProfanityMap(profanityList);

  // Function to check if a word is profane using the profanity map
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

  module Reel {
    public func compare(reel1 : Reel, reel2 : Reel) : Order.Order {
      Int.compare(reel2.id, reel1.id);
    };
  };

  let reels = Map.empty<Nat, Reel>();
  var nextReelId = 0;

  // Save or update user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (isProfane(profile.bio)) {
      Runtime.trap("Inappropriate language detected in bio. Please remove any profanity.");
    };
    userProfiles.add(caller, profile);
  };

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get user profile by principal
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  // Upload a new reel
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

  // Get a specific reel by ID
  public query ({ caller }) func getReel(id : Nat) : async Reel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    switch (reels.get(id)) {
      case (null) { Runtime.trap("Reel not found") };
      case (?reel) { reel };
    };
  };

  // Get all reels sorted by ID (newest first)
  public query ({ caller }) func getAllReels() : async [Reel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    reels.values().toArray().sort();
  };

  // Get reels uploaded by a specific user
  public query ({ caller }) func getReelsByUploader(uploader : Principal) : async [Reel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reels");
    };
    // Filter and collect matching reels
    let filteredReels = reels.values().filter(
      func(reel) {
        reel.uploader == uploader;
      }
    );

    // Convert to array and sort by ID (newest first)
    filteredReels.toArray().sort();
  };
};

