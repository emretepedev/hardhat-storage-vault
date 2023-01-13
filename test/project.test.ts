// tslint:disable no-implicit-dependencies
import chai from "chai";
import spies from "chai-spies";
import { HardhatPluginError } from "hardhat/plugins";
// tslint:enable no-implicit-dependencies

import { PLUGIN_NAME, TASK_STORAGE_CHECK } from "../src/constants";

import { useEnvironment } from "./helpers";

chai.use(spies);

const expect = chai.expect;
const assert = chai.assert;
const sandbox = chai.spy.sandbox();

// TODO: add some tests
describe("Integration tests", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    beforeEach(() => {
      sandbox.on(console, "log");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("Should success when use storage-store.json", async function () {
      await this.hre.run(TASK_STORAGE_CHECK, {
        storeFile: "storage-store.json",
      });
      expect(getConsoleMessage(2)).to.include(
        `Success in plugin ${PLUGIN_NAME}`
      );
    });

    it("Should give error when use error-storage-store.json", async function () {
      try {
        await this.hre.run(TASK_STORAGE_CHECK, {
          storeFile: "error-storage-store.json",
        });
      } catch (error: any) {
        assert.instanceOf(error, HardhatPluginError);
        expect(error.message).include("Invalid slot value");
      }
    });

    it("Should give error when use missing-storage-store.json", async function () {
      try {
        await this.hre.run(TASK_STORAGE_CHECK, {
          storeFile: "missing-storage-store.json",
        });
      } catch (error: any) {
        assert.instanceOf(error, HardhatPluginError);
        expect(error.message).include("Missing slot value");
      }
    });
  });

  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the 'storeFile' to the config", function () {
      assert.equal(
        this.hre.config.storageVault.check.storeFile,
        "storage-store.json"
      );
    });
  });
});

const getConsoleMessage = (index = 0) =>
  // @ts-ignore
  console.log.__spy.calls[index][0];
