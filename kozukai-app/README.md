# 小遣いメモ アプリ

小遣いの無駄遣いを減らすためのシンプルな記録アプリ。

## 機能

| 機能 | 説明 |
|------|------|
| 予算管理 | 月の小遣い予算と残額をひと目で確認 |
| 手動登録 | 金額・カテゴリを2タップで素早く登録 |
| 写真から登録 | レシートやPayPay画面を撮影→内容を確認して保存 |
| 履歴一覧 | 月別・カテゴリ別フィルタ、並び替え、編集・削除 |
| 分析 | カテゴリ別集計・店別ランキング・週別推移グラフ |
| 傾向コメント | 「コンビニが多め」など事実ベースのサジェスト |
| CSVエクスポート | 全データをExcel対応CSVでダウンロード |

## 起動方法

### 必要環境
- Node.js 18以上
- npm

### インストール

```bash
cd kozukai-app
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

### ダミーデータで確認したい場合

アプリを起動後、ホーム画面下部の「ダミーデータを追加」ボタンをクリック。
または設定画面 → 「ダミーデータを追加」でも可。

約30件のサンプル支出データが追加されます。

## データの保存場所

`data/db.json` にJSONファイルとして保存されます（自動生成）。
バックアップはこのファイルをコピーするだけです。

```
kozukai-app/
└── data/
    └── db.json   ← すべてのデータ
```

## 画像解析（OCR）について

現在はモック実装です（ダミーの解析結果を返します）。

将来的に以下へ差し替え可能な設計になっています：

```
src/lib/image-analyzer.ts の analyzeImage() 関数を差し替えるだけ
```

### Claude Vision API への差し替え例

```bash
npm install @anthropic-ai/sdk
```

```typescript
// src/lib/image-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const base64 = await fileToBase64(file);

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: base64 }
        },
        {
          type: 'text',
          text: 'このレシートまたはPayPay画面から、日付・金額・店名・支払い方法をJSON形式で抽出してください。{ date, amount, merchant, paymentMethod }'
        }
      ]
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

`.env.local` に `ANTHROPIC_API_KEY=sk-ant-...` を追加してください。

## 今後の拡張案

- [ ] Claude Vision API によるリアルOCR実装
- [ ] PayPay履歴CSV の一括インポート
- [ ] 月次レポートのPDF出力
- [ ] 支出カレンダー表示
- [ ] 複数月の比較グラフ
- [ ] 目標金額アラート（「残り5,000円を切りました」）
- [ ] タグ機能（仕事経費、ゴルフ関連など）
- [ ] PWA対応（スマホのホーム画面に追加）
- [ ] データのクラウド同期（複数端末対応）
