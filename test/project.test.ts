// tslint:disable no-implicit-dependencies
import chai from "chai";
import spies from "chai-spies";
import { HardhatPluginError } from "hardhat/plugins";
chai.use(spies);
// tslint:enable no-implicit-dependencies

import { PLUGIN_NAME, TASK_STORAGE_CHECK } from "./../src/constants";
import { useEnvironment } from "./helpers";

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

    it("Should send warning when compiler disable", async function () {
      await this.hre.run(TASK_STORAGE_CHECK, { compile: false });
      expect(getConsoleMessage()).to.include(
        `Warning in plugin ${PLUGIN_NAME}`
      );
    });

    it("Should not send warning when compiler enable", async function () {
      await this.hre.run(TASK_STORAGE_CHECK, { compile: true });
      expect(getConsoleMessage()).to.not.include(
        `Warning in plugin ${PLUGIN_NAME}`
      );
    });

    it("Should success when use storage-store.json", async function () {
      await this.hre.run(TASK_STORAGE_CHECK, {
        storePath: "storage-store.json",
        compile: true,
      });
      expect(getConsoleMessage(2)).to.include(
        `Success in plugin ${PLUGIN_NAME}`
      );
    });

    it("Should give error when use error-storage-store.json", async function () {
      try {
        await this.hre.run(TASK_STORAGE_CHECK, {
          storePath: "error-storage-store.json",
          compile: true,
        });
      } catch (error) {
        assert.instanceOf(error, HardhatPluginError);
      }
    });
  });

  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the 'storePath' to the config", function () {
      assert.equal(
        this.hre.config.storageVault.check.storePath,
        "storage-store.json"
      );
    });

    it("Should add the 'compile' to the config", function () {
      assert.equal(this.hre.config.storageVault.check.compile, false);
    });
  });
});

const getConsoleMessage = (index = 0) =>
  // @ts-ignore
  console.log.__spy.calls[index][0];
