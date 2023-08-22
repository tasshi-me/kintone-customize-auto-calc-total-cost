import { KintoneRestAPIClient } from "@kintone/rest-api-client";

const client = new KintoneRestAPIClient();

// App79: 案件管理アプリ
// App80: 顧客管理アプリ

kintone.events.on(
  // レコード追加・更新成功時のイベント
  ["app.record.create.submit.success", "app.record.edit.submit.success"],
  async (
    event:
      | eventTypes["app.record.create.submit.success"]
      | eventTypes["app.record.edit.submit.success"]
  ) => {
    // イベントオブジェクトからレコードを取得
    // この際にdts-genで生成した型を指定する
    const recordOnEvent: App79.SavedRecord = event.record;

    // 顧客管理アプリのレコード番号を取得
    const customerRecordNumber =
      recordOnEvent.顧客管理レコード番号_関連レコード紐付け用.value;

    // 顧客に紐づくレコードを一括取得
    const relatedRecords = await client.record.getAllRecords<
      // ここでレコードの型を指定できる
      KintoneRestAPI.Record<App79.SavedRecord>
    >({
      app: event.appId,
      condition: `顧客管理レコード番号_関連レコード紐付け用 = "${customerRecordNumber}"`,
    });
    console.log(JSON.stringify(relatedRecords, null, 2));

    // 総費用を計算
    const totalCost = relatedRecords.reduce(
      (sum, record) => sum + Number(record.合計費用.value),
      0
    );
    console.log(totalCost);

    // 顧客管理アプリのレコードを更新
    const recordForUpdate: KintoneRestAPI.PartialRecord<App80.SavedRecord> = {
      総費用: { type: "NUMBER", value: "" + totalCost },
    };
    const result = await client.record.updateRecord({
      app: "80",
      id: customerRecordNumber,
      record: recordForUpdate,
    });
    console.log(result);
  }
);
