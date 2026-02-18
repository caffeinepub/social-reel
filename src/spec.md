# Specification

## Summary
**Goal:** Implement content moderation for polite language across the platform to ensure appropriate content in user profiles and reel descriptions.

**Planned changes:**
- Add content validation to profile bio field that rejects inappropriate language
- Add content validation to reel description field that rejects inappropriate language
- Update ProfileSetupModal and ProfileEditForm to display clear error messages when validation fails
- Update ReelUploadForm to display clear error messages when description validation fails

**User-visible outcome:** Users will receive clear, constructive feedback when attempting to submit inappropriate language in their profile bios or reel descriptions, helping maintain a respectful community environment.
