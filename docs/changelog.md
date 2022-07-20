# Changelog

## 1.11.0: July 20, 2022

- Add `playpass.uploadTemporaryImage()`.

## 1.10.0: July 14, 2022

- Add title, description, and image fields to `CreateLinkOptions`.

## 1.9.0: July 1, 2022

- Add `ShareOptions.inReplyTo`.
- Add `CreateLinkOptions.url`.

## 1.8.0: June 30, 2022

- Add `ShareType.Instagram` and `ShareType.TikTok` for social app detection with
  `playpass.device.getBestShareType`. Passing these to `playpass.share` is currently unimplemented,
  where they are the same as passing `ShareType.Any`.

## 1.7.0: June 24, 2022

- Add `playpass.device.getBestShareType`

## 1.6.0: June 22, 2022

- Add Reddit as an option to `playpass.share`.
- Optimize initialization by lazily loading certain components.

## 1.5.0: June 14, 2022

- Add `playpass rename` to the CLI for renaming a game's subdomain.
- Add `trackProps` params to `playpass.init` and `playpass.share`.

## 1.4.0: May 26, 2022

- Add [leaderboards](/leaderboards) API
- Add new audio project template
