//@ts-nocheck
import { defineStore } from "pinia";
import zh from "ant-design-vue/es/locale/zh_CN";
import en from "ant-design-vue/es/locale/en_US";
import { NetworkId } from "@atlantis-l/radix-tool";
import CustomWorker from "../workers/customWorker?worker&inline";

const state = {};

const MAINNET_DEFAULT_URL = "https://mainnet.radixdlt.com/";

const STOKENET_DEFAULT_URL = "https://stokenet.radixdlt.com/";

state.pageSize = 10;
state.language = "en";
state.networkId = 1;
state.mainnetUrl = MAINNET_DEFAULT_URL;
state.stokenetUrl = STOKENET_DEFAULT_URL;
state.currentPath = "/StartToUse";
state.selectedKeys = ["StartToUse"];
state.menuFoldState = false;

if (!state.mainnetUrl.trim().length) {
  state.mainnetUrl = MAINNET_DEFAULT_URL;
}

if (!state.stokenetUrl.trim().length) {
  state.stokenetUrl = STOKENET_DEFAULT_URL;
}

const worker = new CustomWorker();

export default defineStore("store", {
  state: () => ({
    cookies: null,
    worker,
    language: state.language,
    pageSize: state.pageSize,
    networkId: state.networkId,
    mainnetUrl: state.mainnetUrl,
    stokenetUrl: state.stokenetUrl,
    currentPath: state.currentPath,
    selectedKeys: state.selectedKeys,
    menuFoldState: state.menuFoldState,
    mainnetDefaultUrl: MAINNET_DEFAULT_URL,
    stokenetDefaultUrl: STOKENET_DEFAULT_URL,
  }),
  actions: {
    init(cookies) {
      this.cookies = cookies;

      if (cookies.get("pageSize")) {
        this.pageSize = parseInt(cookies.get("pageSize"));
      } else {
        cookies.set("pageSize", this.pageSize);
      }

      if (cookies.get("language")) {
        this.language = cookies.get("language");
      } else {
        this.language = navigator.language.includes("zh") ? "zh" : "en";
        cookies.set("language", this.language);
      }

      if (cookies.get("networkId")) {
        this.networkId = parseInt(cookies.get("networkId"));
      } else {
        cookies.set("networkId", this.networkId);
      }

      if (cookies.get("mainnetUrl")) {
        this.mainnetUrl = cookies.get("mainnetUrl");
      } else {
        cookies.set("mainnetUrl", this.mainnetUrl);
      }

      if (cookies.get("stokenetUrl")) {
        this.stokenetUrl = cookies.get("stokenetUrl");
      } else {
        cookies.set("stokenetUrl", this.stokenetUrl);
      }

      if (cookies.get("currentPath")) {
        this.currentPath = cookies.get("currentPath");
      } else {
        cookies.set("currentPath", this.currentPath, "1h");
      }

      if (cookies.get("selectedKeys")) {
        this.selectedKeys = cookies.get("selectedKeys");
      } else {
        cookies.set("selectedKeys", this.selectedKeys, "1h");
      }

      if (cookies.get("menuFoldState")) {
        this.menuFoldState =
          cookies.get("menuFoldState") === "true" ? true : false;
      } else {
        cookies.set("menuFoldState", this.menuFoldState);
      }
    },
    setPageSize(size: number) {
      this.pageSize = size;
      this.cookies.set("pageSize", size);
    },
    setNetworkId(id: number) {
      this.networkId = id;
      this.cookies.set("networkId", id);
    },
    setLanguage(symbol: string) {
      this.language = symbol;
      this.cookies.set("language", symbol);
    },
    setMenuFoldState(state: boolean) {
      this.menuFoldState = state;
      this.cookies.set("menuFoldState", state);
    },
    setCurrentPath(currentPath: string) {
      this.currentPath = currentPath;
      this.cookies.set("currentPath", currentPath);
    },
    setNetworkUrl(id: number, url: string) {
      if (id === NetworkId.Mainnet) {
        this.mainnetUrl = url;
        this.cookies.set("mainnetUrl", url);
      } else if (id === NetworkId.Stokenet) {
        this.stokenetUrl = url;
        this.cookies.set("stokenetUrl", url);
      }
    },
    setSelectedKeys(selectedKeys: string[]) {
      this.selectedKeys = selectedKeys;
      this.cookies.set("selectedKeys", selectedKeys);
    },
  },
  getters: {
    locale() {
      return this.language === "en" ? en : zh;
    },
  },
});
