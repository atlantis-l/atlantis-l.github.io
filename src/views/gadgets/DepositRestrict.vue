<template>
  <a-layout class="view-layout">
    <a-row>
      <a-col flex="1">
        <a-alert show-icon type="info" style="user-select: none">
          <template #message>
            {{
              $t(
                "csv-zhong-bao-cun-zhang-hu-di-zhi-de-lie-gai-lie-de-lie-ming-xu-wei-di-zhi",
              )
            }}
          </template>
        </a-alert>
      </a-col>
    </a-row>

    <a-row>
      <a-col flex="1">
        <a-upload-dragger name="file" :customRequest="uploadCSV">
          <p class="ant-upload-drag-icon" style="font-size: 48px">
            <CreateIcon icon="InboxOutlined" />
            CSV
          </p>
          <p class="ant-upload-text">
            <a-tag color="blue" style="font-size: 14px">{{
              csvFileText
            }}</a-tag>
          </p>
        </a-upload-dragger>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script lang="ts">
import Papa from "papaparse";
import FileSaver from "file-saver";
import { defineComponent } from "vue";
import store from "../../stores/store";
import { message } from "ant-design-vue";
import { CreateIcon, sleep } from "../../common";
import { RadixNetworkChecker } from "@atlantis-l/radix-tool";

export default defineComponent({
  components: { CreateIcon },
  data() {
    return {
      store: store(),
      csvFileName: "",
      csvLines: [] as object[],
      addressAndRuleMap: new Map<string, string>(),
      networkChecker: new RadixNetworkChecker(store().networkId),
    };
  },
  computed: {
    csvFileText() {
      return this.csvFileName.length
        ? this.csvFileName
        : this.$t("dian-ji-huo-tuo-ru-lai-shang-chuan-csv-wen-jian");
    },
  },
  watch: {
    "store.networkId"() {
      this.networkChecker.networkId = this.store.networkId;
    },
  },
  methods: {
    async uploadCSV(data: { file: File }) {
      if (!data.file.name.toLowerCase().endsWith(".csv")) {
        message.error({
          content: `「 ${this.$t("View.PackageDeploy.script.fileError")} 」`,
          key: "uploadError",
        });
        return;
      }

      this.csvFileName = data.file.name;

      Papa.parse(data.file, {
        skipEmptyLines: "greedy",
        header: true,
        transformHeader: (header, _index) => {
          if (header === "地址") return "Address";
          return header;
        },
        complete: (file) => {
          //@ts-ignore
          this.csvLines = file.data;

          if (this.validateNetwork()) {
            this.checkDepositRule();
          }
        },
      });
    },
    validateNetwork() {
      //@ts-ignore
      const address = this.csvLines[0]["Address"] as string;

      if (!address || !address.startsWith("account")) return false;

      if (address.startsWith("account_tdx_2") && this.store.networkId !== 2) {
        message.warn({
          key: "net",
          content: `「 ${this.$t(
            "dang-qian-wang-luo-wei-zhu-wang-xu-gai-wei-ce-shi-wang",
          )} 」`,
        });

        return false;
      } else if (
        address.startsWith("account_rdx") &&
        this.store.networkId !== 1
      ) {
        message.warn({
          key: "net",
          content: `「 ${this.$t(
            "dang-qian-wang-luo-wei-ce-shi-wang-xu-gai-wei-zhu-wang",
          )} 」`,
        });

        return false;
      }

      return true;
    },
    async checkDepositRule() {
      this.addressAndRuleMap.clear();
      const key = "checkDepositRule";

      message.loading({
        key,
        duration: 0,
        content: `「 ${this.$t(
          "zheng-zai-jian-cha-zhang-hu-cun-kuan-gui-ze",
        )} 」`,
      });

      const MAX_ADDRESS_PER_CHECK = 20;

      const addresses = [
        ...new Set(
          //@ts-ignore
          this.csvLines.map((line) => line["Address"] as string),
        ).values(),
      ];

      for (let i = 0; ; i++) {
        const start = i * MAX_ADDRESS_PER_CHECK;

        let end = i * MAX_ADDRESS_PER_CHECK + MAX_ADDRESS_PER_CHECK;

        end = end > addresses.length ? addresses.length : end;

        await sleep(i, 50, 1000);

        this.networkChecker
          .checkEntities(addresses.slice(start, end))
          .then((res) => {
            if (res.items && res.items.length) {
              res.items.forEach((item) => {
                this.addressAndRuleMap.set(
                  item.address,
                  //@ts-ignore
                  item.details.state.default_deposit_rule,
                );

                if (this.addressAndRuleMap.size === addresses.length) {
                  message.success({
                    key,
                    content: `「 ${this.$t("jian-cha-wan-cheng")} 」`,
                  });

                  this.markAddresses();

                  this.downloadCSV();
                }
              });
            }
          })
          .catch((e: Error) => {
            console.error(e.message);

            message.error({
              key,
              content: `「 ${this.$t(
                "wang-luo-yi-chang-qing-zhong-xin-jian-cha",
              )} 」`,
            });
          });

        if (end === addresses.length) break;
      }
    },
    markAddresses() {
      const ruleText =
        this.store.language === "zh" ? "存款规则" : "Deposit Rule";

      this.addressAndRuleMap.forEach((v, k) => {
        if (v !== "Accept") {
          this.csvLines.forEach((o) => {
            //@ts-ignore
            if (o["Address"] === k) {
              //@ts-ignore
              o[ruleText] = v;
            }
          });
        }
      });
    },
    downloadCSV() {
      const fileData = {
        fields: [] as string[],
        data: [] as string[][],
      };

      const names = Object.getOwnPropertyNames(this.csvLines[0]);

      names.forEach((name) => {
        if (name === "Address") {
          const addressText = this.store.language === "zh" ? "地址" : "Address";

          fileData.fields.push(addressText);
        } else {
          fileData.fields.push(name);
        }
      });

      const ruleText =
        this.store.language === "zh" ? "存款规则" : "Deposit Rule";

      if (!fileData.fields.includes(ruleText)) {
        fileData.fields.push(ruleText);
      }

      this.csvLines.forEach((line) => {
        const row: any[] = [];

        fileData.fields.forEach((field) => {
          //@ts-ignore
          row.push(line[field === "地址" ? "Address" : field]);
        });

        fileData.data.push(row);
      });

      const result = Papa.unparse(fileData);

      FileSaver.saveAs(
        new Blob([result], { type: "text/plain;charset=utf-8" }),
        `${this.csvFileName.split(".")[0]}.csv`,
      );
    },
  },
});
</script>

<style scoped>
.ant-layout {
  background-color: #fff;
}
</style>
