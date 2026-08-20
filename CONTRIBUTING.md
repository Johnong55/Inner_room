# Contributing to InnerRoom

## Branch workflow

`main` là nhánh ổn định và không dùng để phát triển trực tiếp. Mọi thay đổi bắt đầu từ một nhánh mới:

- `feature/<ten-ngan>` cho tính năng
- `fix/<ten-ngan>` cho sửa lỗi
- `chore/<ten-ngan>` cho hạ tầng và bảo trì
- `release/<version>` cho bản APK preview

Mở Pull Request vào `main` sau khi CI đạt. Không force-push hoặc commit trực tiếp lên `main`.

## Commit convention

Dùng commit message ngắn, ở thể mệnh lệnh và theo Conventional Commits, ví dụ:

```text
feat: add monthly emotional calendar
fix: keep composer above Android keyboard
chore: configure mobile CI
```

Commit phải dùng danh tính Git của người sở hữu hoặc người đóng góp. Không dùng tên công cụ AI làm author, committer hoặc nội dung commit message.

## Checks before a Pull Request

```bash
npm ci
npm run typecheck
npm run lint
npm --prefix server ci
npm --prefix server run build
npm --prefix server test
```

Nhánh `release/*` tự động tạo APK arm64 dành cho kiểm thử nội bộ. APK này xuất hiện trong phần Artifacts của GitHub Actions và không phải bản ký để phát hành Google Play.
