<template>
    <div>
        <h3>Version: {{ version }}</h3>
        <form>
            <label><input
                v-model="options.percent_main_page"
                type="checkbox"
            >Load final percent and missing assignments on overall grade page (More network intensive)</label>
            <br>
            <label><input
                v-model="options.save_last_grades"
                type="checkbox"
            >Enable last seen grades, shows last seen grades without logging in to PowerSchool, can be used during exams when PowerSchool is closed.</label>
            <br>
        </form>
        <br>
        <footer>
            <br>
            SAS Powerschool Enhancement Suite is the collective work of many different people working together publicly. Visit our <a
                href="https://github.com/sas-fossdev/saspes"
                target="_blank"
            >GitHub page</a> if you'd like to participate as well.<br>
            <br>
            If you believe you have encountered a bug in the extension, or have any other inquiries, please create an issue on <a
                href="https://github.com/sas-fossdev/saspes/issues"
                target="_blank"
            > the repository</a> or email <a
                href="mailto:contact@suhas.net"
                target="_blank"
            >contact@suhas.net</a><br>
            <br>
            Credits: <br>
            Special thanks to Alan Chang for the idea. <br>
            <a
                :href="thirdPartyLibraries"
                target="_blank"
            >Third-Party Libraries</a>
        </footer>
    </div>
</template>

<script>
import browser from 'webextension-polyfill';

function defaultOptions () {
    return {
        id: "Not set yet",
        ignoreNextReset: false,
        percent_main_page: true,
        save_last_grades: false,
    };
}

export default {
    name: "Options",
    data () {
        return {
            options: defaultOptions(),
            copiedRecently: false,
            thirdPartyLibraries: browser.extension.getURL('web_accessible_resources/libraries.txt'),
            version: SASPES_VERSION_NAME,
        };
    },
    watch: {
        options: {
            deep: true,
            async handler (val) {
                if (this.ignoreNextReset) {
                    this.ignoreNextReset = false;
                    return;
                }
                await browser.storage.local.set({ "percent_main_page": { changed: true, value: val.percent_main_page }, "opted_in": { changed: true, value: val.save_last_grades } });
            },
        },
    },
    async mounted () {
        await this.resetData();
        browser.storage.onChanged.addListener(this.resetData);
    },
    methods: {
        async resetData () {
            const stored_options = await browser.storage.local.get(null);
            this.ignoreNextReset = true;
            this.options = { "percent_main_page": stored_options?.percent_main_page?.value || this.options.percent_main_page, "save_last_grades": stored_options?.opted_in?.value || this.options.save_last_grades };
        },
    },
};
</script>

<style scoped>

</style>
