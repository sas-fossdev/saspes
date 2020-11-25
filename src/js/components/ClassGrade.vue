<!--
 - @copyright Copyright (c) 2020 Gary Kim <gary@garykim.dev>
 - @copyright Copyright (c) 2020 Suhas Hariharan <contact@suhas.net>
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
    <div>
        <v-popover
            :open="showPopover && assignmentsMissing.length > 0"
            :delay="{ show: 350, hide: 0 }"
            placement="bottom"
            trigger="manual"
        >
            <div
                @mouseenter="showPopover = true"
                @mouseleave="showPopover = false"
            >
                <a
                    class="bold"
                    :href="course.link"
                >
                    {{ course.grade }}
                    <template v-if="finalPercent">
                        ({{ finalPercent.toFixed(2) }})
                    </template>
                </a>
                <img
                    v-if="assignmentsMissing.length > 0"
                    id="missing-icon"
                    src="/images/icon_missing.gif"
                    :title="missingNumberMessage"
                >
            </div>
            <template slot="popover">
                <div v-if="assignmentsMissing.length > 0">
                    <div class="section-title">
                        Missing {{ assignmentsMissing.length }} Assignment{{ assignmentsMissing.length > 1 ? 's' : '' }}
                    </div>
                    <div class="section-content">
                        <div
                            v-for="assignment in assignmentsMissing"
                            :key="assignment.order"
                        >
                            {{ assignment.name }}
                        </div>
                    </div>
                </div>
            </template>
        </v-popover>
    </div>
</template>

<script>
import Course from "../models/Course";

import { VPopover } from 'v-tooltip';
import browser from 'webextension-polyfill';

export default {
    name: "ClassGrade",
    components: {
        VPopover,
    },
    props: {
        course: {
            type: Course,
            required: true,
        },
        showMissing: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {
            finalPercent: this.course.finalPercent,
            assignments: this.course.assignments,
            showPopover: false,
        };
    },
    computed: {
        missingNumberMessage () {
            return `Missing ${this.assignmentsMissing.length} assignment${(this.assignmentsMissing.length > 1) ? 's' : ''} for ${this.course.name}`;
        },
        assignmentsMissing () {
            if (this.assignments) {
                return this.assignments.filter(e => e.isMissing());
            }
            return [];
        },
    },
    async mounted () {
        if (!(await browser.storage.local.get({ percent_main_page: true })).percent_main_page) {
            return;
        }
    },
};
</script>

<style lang="less" scoped>
@header-color: #a3bfcc;

#missing-icon {
    padding: 3px 3px 0 3px;
    margin: 0;
}
.section {
    &-title {
        font-weight: bold;
        background: @header-color;
        padding: 5px 5px 0 5px;
        text-align: center;
    }

    &-content {
        padding: 5px;
    }
}
</style>

<style lang="less">
.tooltip {
    @header-color: #a3bfcc;
    display: block !important;
    z-index: 10000;

    .tooltip-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: black;
        z-index: 1;
    }

    &[x-placement^="top"] {
        margin-bottom: 5px;

        .tooltip-arrow {
            border-width: 5px 5px 0 5px;
            border-left-color: transparent !important;
            border-right-color: transparent !important;
            border-bottom-color: transparent !important;
            bottom: -5px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }

    &[x-placement^="bottom"] {
        margin-top: 5px;

        .tooltip-arrow {
            border-width: 0 5px 5px 5px;
            border-color: @header-color !important;
            border-left-color: transparent !important;
            border-right-color: transparent !important;
            border-top-color: transparent !important;
            top: -5px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }

    &[x-placement^="right"] {
        margin-left: 5px;

        .tooltip-arrow {
            border-width: 5px 5px 5px 0;
            border-left-color: transparent !important;
            border-top-color: transparent !important;
            border-bottom-color: transparent !important;
            left: -5px;
            top: calc(50% - 5px);
            margin-left: 0;
            margin-right: 0;
        }
    }

    &[x-placement^="left"] {
        margin-right: 5px;

        .tooltip-arrow {
            border-width: 5px 0 5px 5px;
            border-top-color: transparent !important;
            border-right-color: transparent !important;
            border-bottom-color: transparent !important;
            right: -5px;
            top: calc(50% - 5px);
            margin-left: 0;
            margin-right: 0;
        }
    }

    &.popover {

        .popover-inner {
            background: #f9f9f9;
            color: black;
            padding: 0 0 5px 0;
            border-radius: 5px;
            box-shadow: 0 5px 30px rgba(black, .3);
            overflow: hidden;
        }

        .popover-arrow {
            border-color: #f9f9f9;
            z-index: 5000;
        }
    }
}
</style>
