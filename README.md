# Mobile Wedding Invitation

최영찬, 이승현 모바일 청첩장 프로젝트입니다.

## GitHub Pages로 배포하기

이 프로젝트는 정적 사이트라서 GitHub Pages에 바로 배포할 수 있습니다.
현재 설정은 `main` 브랜치 루트를 바로 배포하는 가장 단순한 방식입니다.

### 1. GitHub에서 빈 저장소 만들기

추천 저장소 이름 예시:

- `youngchan-seunghyeon-wedding`
- `wedding-invitation-20260829`

공개 링크는 기본적으로 아래 형태가 됩니다.

- `https://<github-username>.github.io/<repository-name>/`

### 2. 이 폴더를 Git 저장소로 만들고 push하기

PowerShell 기준:

```powershell
git init -b main
git add .
git commit -m "Initial wedding invitation site"
git remote add origin https://github.com/<github-username>/<repository-name>.git
git push -u origin main
```

### 3. GitHub Pages 확인하기

push 후 GitHub 저장소에서 아래를 확인하면 됩니다.

- `Settings > Pages`에서 배포 주소 확인

배포 소스는 `Deploy from a branch`, 브랜치는 `main`, 폴더는 `/ (root)` 기준으로 맞추면 됩니다.

## 짧게 쓰는 도메인 붙이기

며칠만 사용할 거라면 루트 도메인보다 `invite.example.com` 같은 서브도메인이 가장 편합니다.

1. GitHub 저장소 `Settings > Pages`로 이동
2. `Custom domain`에 원하는 서브도메인 입력
3. 도메인 관리 업체에서 `CNAME` 레코드를 `<github-username>.github.io`로 연결

예시:

- `invite.example.com CNAME <github-username>.github.io`

## 배포 전에 같이 확인하면 좋은 것

- 최종 저장소 이름이 정해지면 공유용 URL이 확정됩니다.
- 카카오톡 썸네일까지 정확히 맞추려면 최종 배포 URL 기준으로 `og:url`, `og:image`를 한 번 더 점검하는 것이 좋습니다.
- 커스텀 도메인을 붙일 계획이면, 도메인 연결 뒤 최종 메타 태그를 다시 확인하는 편이 안정적입니다.

## 네이버 지도 API 연결

- 네이버 지도 임베드는 `config.js`의 `naverMapKeyId` 값을 사용합니다.
- GitHub Pages 주소를 그대로 쓸 경우, 네이버 클라우드 플랫폼 Maps 애플리케이션에 `https://ychoib.github.io` 도메인을 등록해야 정상 로드됩니다.
- 최신 Maps 문서 기준으로 스크립트 로드 파라미터는 `ncpKeyId`입니다.
- `Key ID`가 비어 있으면 지도 영역은 안내 문구로 대체되고, 네이버지도 웹 링크만 표시됩니다.
