Todo

絶対に終わらせること
- できる限りのテスト（実機を含む）
- Debug errors seen during upload of prize CSV
- Text sizes on handoff screen for nonexistent prizes

できればやりたいこと
- より精密なエラーハンドリング
- 景品表示から時間経過で自動的に進める?
- より分かりやすいグループ表示
- 抽選画面の下半分にいい感じの模様とかを追加する
- 見た目を細部まで配信素材に合わせる

Done
- 他デバイスから接続できるように、ドメインを自動設定するようにする
- キー入力で抽選操作（nで次、rで再抽選）
- Docker化
- 簡単なエラーハンドリング
- 受け渡し画面の最適化
- 抽選開始時のアニメーション
- メインメニューの見た目改善
- 当選→景品表示にシャッフル表示が開始されないようにする
- 抽選中の編集画面の作製
- 抽選完了画面の追加
- 景品受け渡し画面の修正
- 複数当選に対応
- 最低限のグループ表示
- 見た目を配信素材にある程度合わせる



Removed window controls
                  <Popover width={200} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Center w="2em" h="1.5em" bdrs="0.3em" style={{ backgroundColor: "rgb(242, 214, 184)", borderStyle: "solid", borderColor: "rgb(91, 69, 46)", borderWidth: "1.5px", cursor: "pointer" }}>
                        <PiXBold size="1.5em" color="rgb(91, 69, 46)" />
                      </Center>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack>
                        <Button leftSection={<PiPencilBold size="1em" />} onClick={() => { setControlPopoverOpened(false); openEditPane() }}>
                          当選者の編集
                        </Button>
                        <Button leftSection={<PiXBold size="1em" />} onClick={() => navigate("~/transition/exit")}>
                          抽選を中断
                        </Button>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>