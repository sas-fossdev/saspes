<!--
 - @copyright Copyright (c) 2018-2019 Gary Kim <gary@garykim.dev>
 - 
 - @author Gary Kim <gary@garykim.dev>
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
 - GNU General Public License for more details.
 -
 - You should have received a copy of the GNU Affero General Public License
 - along with this program.  If not, see <https://www.gnu.org/licenses/>.
 -->

<template>
    <div id="saspes-info">
        <h3>
            <img
                :src="logo"
                class="saspes-logo"
            >
            SAS Powerschool Enhancement Suite
        </h3>
        <div class="saspes-content">
            <p style="font-size: 1.5em;">
                Version: {{ version }}
            </p>
            <p>
                <a
                    class="saspes-link"
                    href="https://github.com/gary-kim/saspes"
                    target="_blank"
                    @click="link_analytics"
                >Project Website</a> |
                <a
                    href="https://github.com/gary-kim/saspes/blob/master/CHANGELOG.md"
                    class="saspes-link"
                    target="_blank"
                    @click="link_analytics"
                >Changelog</a> |
                <a
                    class="saspes-link"
                    href="https://github.com/gary-kim/saspes"
                    target="_blank"
                    @click="link_analytics"
                >Source Code</a> |
                <a
                    id="login-extension-settings"
                    href="#"
                    @click.prevent="open_settings"
                >Extension Options</a>
            </p>
        </div>
    </div>
</template>
<script>
const browser = require("webextension-polyfill");

export default {
    name: "ExtensionInfo",
    data() {
        return {
            logo: browser.runtime.getURL("icons/128.png"),
            version: browser.runtime.getManifest().version
        };
    },
    methods: {
        link_analytics(e) {
            let href = e.currentTarget.href;
            browser.runtime.sendMessage({
                action: "analytics_send",
                args: { url: href, extra: { link: href } }
            });
        },
        open_settings() {
            browser.runtime.sendMessage({ action: "open_settings" });
        }
    }
};
</script>
<style scoped>
    #saspes-info {
        background-color: #FFF;
        box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        position: relative;
        padding-bottom: 1px;
        margin-top: 50px;
        padding: 0;
        font-size: inherit;
        color: #444444;
    }
    .saspes-content {
        padding: 20px;
    }
    .saspes-logo {
        height: 2em;
        padding-right: 0.7em;
    }
</style>
