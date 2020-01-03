<!--
 - @copyright Copyright (c) 2018-2020 Gary Kim <gary@garykim.dev>
 -
 - @author Gary Kim <gary@garykim.dev>
 -
 - @license GNU AGPL version 3 only
 -
 - SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 -
 - This program is free software: you can redistribute it and/or modify
 - it under the terms of the GNU Affero General Public License as
 - published by the Free Software Foundation, version 3.
 -
 - This program is distributed in the hope that it will be useful,
 - but WITHOUT ANY WARRANTY; without even the implied warranty of
 - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 - GNU Affero General Public License for more details.
 -
 - You should have received a copy of the GNU Affero General Public License
 - along with this program.  If not, see <https://www.gnu.org/licenses/>.
 -->

<template>
    <div id="saspes-info">
        <h3 @click="toggleInfo">
            <img
                :src="logo"
                class="saspes-logo"
            >
            SAS Powerschool Enhancement Suite
            <div
                :class="{ 'arrow-down': showInfo, 'arrow-left': !showInfo }"
                class="arrow"
            />
        </h3>
        <div
            v-if="showInfo"
            class="saspes-content"
        >
            <p style="font-size: 1.5em;">
                Version: {{ version }}
            </p>
            <p><b>Do not rely</b> on the data provided by SAS PES.</p>
            <p>
                <a
                    class="saspes-link"
                    href="https://github.com/gary-kim/saspes/"
                    target="_blank"
                    @click="link_analytics"
                >Website/Source Code</a> |
                <a
                    href="https://github.com/gary-kim/saspes/blob/master/CHANGELOG.md"
                    class="saspes-link"
                    target="_blank"
                    @click="link_analytics"
                >Changelog</a> |
                <a
                    class="saspes-link"
                    href="https://github.com/gary-kim/saspes/issues"
                    target="_blank"
                    @click="link_analytics"
                >Issue Tracker</a> |
                <a
                    class="saspes-link"
                    href="https://github.com/gary-kim/saspes/blob/master/LICENSE"
                    target="_blank"
                    @click="link_analytics"
                >License (AGPL-3.0-only)</a> |
                <a
                    id="login-extension-settings"
                    href="#"
                    @click.prevent="open_settings"
                >Options</a>
            </p>
        </div>
    </div>
</template>
<script>
const browser = require("webextension-polyfill");

export default {
    name: "ExtensionInfo",
    data () {
        return {
            logo: browser.runtime.getURL("icons/128.png"),
            version: SASPES_VERSION_NAME,
            showInfo: false,
        };
    },
    methods: {
        link_analytics (e) {
            const href = e.currentTarget.href;
            browser.runtime.sendMessage({
                action: "analytics_send",
                args: { url: href, extra: { link: href } },
            });
        },
        toggleInfo () {
            this.showInfo = !this.showInfo;
            browser.storage.local.set({ showExtensionInfo: this.showInfo });
        },
        open_settings () {
            browser.runtime.sendMessage({ action: "open_settings" });
        },
    },
};
</script>
<style lang="less" scoped>
    #saspes-info {
        background-color: #FFF;
        box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        position: relative;
        padding-bottom: 1px;
        margin-top: 50px;
        padding: 0;
        font-size: inherit;
        color: #444444;

        & > h3 {
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 5px 0;
            user-select: none;
            border-bottom: initial;
        }

        .arrow {
            margin: 0 0 0 auto;
        }
    }
    .saspes-content {
        padding: 0 20px 10px 20px;
    }
    .saspes-logo {
        height: 2em;
        padding-right: 0.7em;
    }
    b {
        margin: initial !important;
    }
    .arrow {
        vertical-align: middle;
        transition-property: transform;
        transition-duration: 0.2s;

        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 5px solid grey;

        &.arrow-left {
            transform: rotate(270deg);
        }

        &.arrow-down {
            transform: rotate(180deg);
        }

    }
</style>
