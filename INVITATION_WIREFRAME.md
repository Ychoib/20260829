# Mobile Wedding Invitation Wireframe

## Project Direction

- Tone: Minimal and cute
- Mood keywords: clean, soft, warm, gentle, charming
- Primary audience: guests viewing on mobile first
- Visual rule: lots of whitespace, small rounded accents, one soft point color
- Hero image: `C:\Users\ychoi\Downloads\260207 최영찬 이승현\DOO_0451.jpg`

## Fixed Information

- Groom: 최영찬
- Bride: 이승현
- Date: 2026.08.29 (토)
- Time: 13:30
- Venue: 잠실 더 컨벤션 3층 비스타홀
- Address: 서울 송파구 올림픽로 319 3층
- Groom contact: 010-8514-7246
- Bride contact: 010-2967-6266
- Account: 우리은행 1002-753-424111
- Account holder: 최영찬

## Visual Style

- Background: warm ivory `#F8F4EE`
- Text: deep charcoal `#2A2522`
- Point color: butter beige `#D8B98A`
- Secondary point: muted sage `#A8B29A`
- Shape language: rounded buttons, soft card edges, light dividers

## Mobile Page Flow

1. Hero
2. Invitation Message
3. Wedding Information
4. Location and Directions
5. Gallery
6. Contact
7. Gift Account
8. Share

## Wireframe

### 1. Hero

- Full-screen first view
- Background image: `DOO_0451.jpg`
- Text block position: bottom center
- Overlay: soft ivory gradient from bottom to top for readability

#### Content

- 최영찬 & 이승현
- 2026.08.29 토요일 오후 1시 30분
- 잠실 더 컨벤션 3층 비스타홀
- Small prompt: 아래로 스크롤

#### Notes

- Keep typography elegant and simple
- Couple names should be the strongest text
- Add one tiny decorative icon only if needed, such as a flower or ribbon

### 2. Invitation Message

- Narrow centered text block
- Plenty of top and bottom spacing
- Optional small flower doodle above title

#### Title

- Invitation

#### Copy

서로의 하루를 함께하며
같은 곳을 바라보게 된 저희가
소중한 분들을 모시고 새로운 시작을 약속하려 합니다.

기쁜 날, 따뜻한 마음으로 함께해 주시면
큰 기쁨이 되겠습니다.

### 3. Wedding Information

- Two or three soft cards stacked vertically
- Each card contains one key item

#### Card 1

- 날짜
- 2026년 8월 29일 토요일
- 오후 1시 30분

#### Card 2

- 장소
- 잠실 더 컨벤션 3층 비스타홀
- 서울 송파구 올림픽로 319 3층

#### Card 3

- 연락
- 신랑 010-8514-7246
- 신부 010-2967-6266

### 4. Location and Directions

- Recommended format: text cards matching page style
- Fast fallback: use the provided directions image

#### Buttons

- 네이버지도
- 카카오맵
- 주소 복사

#### Directions Copy

- 지하철
- 2호선 잠실역 8번출구 약 300m
- 8호선 잠실역 9번 출구 약 30m

- 버스
- 일반버스 16, 32, 100, 101
- 간선 310, 341, 360
- 지선 2311, 3411
- 광역, 직행버스 1000, 1100, 1700
- 공항버스 6000, 6006

- 자가용
- 서울 송파구 올림픽로 319
- 구주소 송파구 신천동 11-7

- 주차
- 교통회관 지상, 지하 주차장 이용

### 5. Gallery

- 2-column mobile grid
- 9 or 12 photos recommended
- Tap to open full-screen lightbox
- Mix clean portraits and cute casual cuts

#### Recommended Photo Roles

- Hero: `DOO_0451.jpg`
- OG share image: `DOO_0142.jpg`
- Minimal couple cut: `DOO_0170.jpg`
- Cute casual cut: `DOO_0790.jpg`
- Nature portrait: `DOO_0334.jpg`
- Groom solo: `DOO_0473.jpg`
- Bride solo: `DOO_0610.jpg`
- Soft formal couple: `DOO_0433.jpg`
- Styling variation: `DOO_0736.jpg`
- Architecture mood cut: `DOO_1046.jpg`

### 6. Contact

- Two rounded action buttons
- One for groom, one for bride
- Use direct tel links for mobile

#### Labels

- 신랑에게 연락하기
- 신부에게 연락하기

### 7. Gift Account

- Use a collapsible card or soft bordered box
- Keep wording polite and brief

#### Copy

멀리서도 전해주시는 따뜻한 마음에 감사드립니다.

#### Account

- 우리은행 1002-753-424111
- 예금주 최영찬

#### Button

- 계좌번호 복사

### 8. Share

- Final action section with soft background tint
- Include short thank-you message

#### Buttons

- 링크 복사
- 카카오톡 공유
- 캘린더 추가

## Typography Suggestions

- Title font: elegant serif or soft Korean display font
- Body font: clean Korean sans-serif with high readability

### Safe Pairing Ideas

- Title: Cormorant Garamond or MaruBuri
- Body: Pretendard or SUIT

## Motion Suggestions

- Hero text fade-up on load
- Section cards fade in on scroll
- Buttons slightly lift on tap
- Keep motion subtle and calm

## Implementation Notes

- Mobile width target: 390px to 430px
- Sticky bottom CTA is optional, but not required for MVP
- Compress gallery images for performance
- Set open graph image to `DOO_0142.jpg`
- Use map deep links for Naver Map and KakaoMap
- Prioritize legibility over decoration

## Suggested Next Build Step

- Build a single-page mobile-first web invitation with:
  - one hero section
  - soft stacked content cards
  - image gallery lightbox
  - copy-to-clipboard buttons
  - direct call links
  - map buttons
