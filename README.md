# Dark Fairy Tale

숲을 탐험하며 네 권의 동화책을 고르고, 빨간모자의 인물·이야기·역사를 인터랙션으로 살펴보는 웹사이트입니다.

## 로컬 실행

[Node.js](https://nodejs.org/) 20.11 이상을 설치한 뒤 `START-FAIRYTALE.cmd`를 실행하거나 다음 명령을 사용합니다.

```sh
npm ci
npm start
```

브라우저에서 `http://127.0.0.1:4174`를 엽니다. HTML 파일을 더블클릭하는 방식은 3D 파일을 불러올 수 없으므로 사용하지 않습니다. 사이트 실행 자체에는 별도 패키지 설치 없이 `node preview-server.cjs`만 실행해도 됩니다.

## 검사와 배포 파일 만들기

```sh
npm run check
npm run build
node preview-server.cjs --dir dist --port 4175
```

`dist/`에는 연결된 페이지와 실제 사용하는 이미지·동영상·모델·폰트만 포함됩니다. JavaScript와 CSS는 배포 시 압축하며, 편집용 소스는 그대로 유지합니다. 사이트 경로는 상대 경로라서 GitHub Pages의 저장소 하위 주소에서도 사용할 수 있습니다.

## GitHub에 올리기

정리된 `github-ready` 폴더의 **내용 전체**를 저장소 루트에 올립니다. `.github`, `.gitignore` 등 숨김 파일도 포함합니다. `node_modules`, `dist`, 테스트 캡처, 백업, 원본 MOV 파일은 올리지 않습니다.

GitHub Pages를 사용할 경우:

1. 저장소 **Settings → Pages → Source → GitHub Actions**를 선택합니다.
2. **Actions → Deploy GitHub Pages → Run workflow**를 실행합니다.

배포는 수동 실행으로 설정되어 있으며, 이 프로젝트를 준비하는 과정에서 실제 GitHub 업로드나 배포는 실행하지 않았습니다.

## 구성

- `index.html`, `forest-entry/`: 첫 화면과 3D 숲 탐험
- `book-library/`: 네 권의 책, 배경·마우스·입장 효과
- `redridinghood/`: 빨간모자 상세 이야기
- `assets/`: 공용 배경 영상과 이미지
- `scripts/`: 사용 파일 수집, 검사, 배포 폴더 생성

신데렐라·인어공주·백설공주는 현재 간단한 리더 화면까지 제공하며, 빨간모자에 상세 인터랙티브 페이지가 있습니다.

## 미디어와 성능

표지와 주요 삽화는 WebP, 투명 배경 영상은 VP9 WebM으로 제공합니다. 움직임 줄이기 설정을 존중하며 화면 밖 영상은 일시 정지합니다. 투명 WebM 재생은 최신 Chrome/Edge에서 확인하는 것을 권장합니다. 3D 실행이 불가능할 때는 CSS 책 화면으로 대체됩니다.

새로운 동적 파일 경로를 추가했다면 `npm run check`와 배포 화면을 함께 확인합니다. 라이선스 관련 안내는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 확인하세요.
