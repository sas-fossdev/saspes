/**
 *
 * @copyright Copyright (c) 2019-2020 Gary Kim <gary@garykim.dev>
 *
 * @copyright Copyright (c) 2021 Suhas Hariharan <contact@suhas.net>
 *
 * @author Gary Kim <gary@garykim.dev>
 *
 * @license GNU AGPL version 3 only
 *
 * SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import test from 'ava';

import * as helpers from '../helpers';

test('Final Percent to Grade', t => {
    const test_cases = [
        {
            i: "75",
            o: "A",
        },
        {
            i: "74.99999",
            o: "A",
        },
        {
            i: 74.999,
            o: "A",
        },
        {
            i: 74.99,
            o: "B+",
        },
        {
            i: 63.91,
            o: "B",
        },
        {
            i: 0,
            o: "F",
        },
    ];

    t.plan(test_cases.length);

    test_cases.forEach(tc => {
        t.is(helpers.fpToGrade(tc.i), tc.o, `Convert ${tc.i} to Grade`);
    });
});

test('Grade to GPA without Weighting', t => {
    const test_cases = [
        {
            i: "A+",
            o: 4.5,
        },
        {
            i: "A",
            o: 4,
        },
        {
            i: "B+",
            o: 3.5,
        },
        {
            i: "B",
            o: 3,
        },
        {
            i: "C+",
            o: 2.5,
        },
        {
            i: "C",
            o: 2,
        },
        {
            i: "D+",
            o: 1.5,
        },
        {
            i: "D",
            o: 1,
        },
        {
            i: "F",
            o: 0,
        },
        {
            i: "P",
            o: -1,
        },
        {
            i: "",
            o: -1,
        },
        {
            i: "asdjfh",
            o: -1,
        },
        {
            i: 182.2,
            o: -1,
        },
    ];

    t.plan(test_cases.length);

    test_cases.forEach(tc => {
        t.is(helpers.gradeToGPA(tc.i), tc.o, `Convert ${tc.i} to GPA without Weighting`);
    });
});

test('Grade to Final Percent', t => {
    const test_cases = [
        {
            i: "A+",
            o: 90,
        },
        {
            i: "A",
            o: 80,
        },
        {
            i: "B+",
            o: 70,
        },
        {
            i: "B",
            o: 60,
        },
        {
            i: "C+",
            o: 50,
        },
        {
            i: "C",
            o: 40,
        },
        {
            i: "D+",
            o: 30,
        },
        {
            i: "D",
            o: 20,
        },
        {
            i: "F",
            o: 10,
        },
        {
            i: "P",
            o: -1,
        },
        {
            i: "",
            o: -1,
        },
        {
            i: "asdjfh",
            o: -1,
        },
        {
            i: 182.2,
            o: -1,
        },
    ];

    t.plan(test_cases.length);

    test_cases.forEach(tc => {
        t.is(helpers.gradeToFP(tc.i), tc.o, `Convert ${tc.i} to Final Percent`);
    });
});

test('Extract Final Percent from Class Page', t => {
    const test_cases = [
        {

            i: `<tbody>
                    <tr>
                        <td><strong>Final
                                Letter Grade<sup>1</sup>:</strong></td>
                        <td>A</td>
                    </tr>
                    <!--
                            <tr>
                                [if.1=0]<td><strong>
                                        Final Percent:
                                        </strong></td>
                                <td>
                                        <script type="text/javascript">
                                            if ("A" == "--") {
                                                document.write("&nbsp;");
                                            }
                                            else {
                                                document.write("[decode;0041052333;031@;;82.5] &nbsp;");
                                            }
                                        </script>
                                </td>
                                [/if]
                            </tr>
                            -->
                </tbody>`,
            o: 82.5,
        },
        {
            i: `<tbody><tr>
                        <td><strong>Final
                                Letter Grade<sup>1</sup>:</strong></td><td>A</td>
                    </tr>
                    <!--
                    <tr>
                        [if.1=0]<td><strong>
                                Final Percent:
                                </strong></td>
                        <td>
                                <script type="text/javascript">
                                    if ("A" == "--") {
                                        document.write("&nbsp;");
                                    }
                                    else {
                                        document.write("[decode;004976938;031@;;] &nbsp;");
                                    }
                                </script>
                        </td>
                        [/if]
                    </tr>
                    -->
                </tbody>`,
            o: undefined,
        },
        {
            i: `<tbody><tr>
                        <td><strong>Final
                                Letter Grade<sup>1</sup>:</strong></td><td>A+</td>
                    </tr>
                    <!--
                    <tr>
                        [if.1=0]<td><strong>
                                Final Percent:
                                </strong></td>
                        <td>
                                <script type="text/javascript">
                                    if ("A+" == "--") {
                                        document.write("&nbsp;");
                                    }
                                    else {
                                        document.write("[decode;004976943;031@;;90] &nbsp;");
                                    }
                                </script>
                        </td>
                        [/if]
                    </tr>
                    -->
                </tbody>`,
            o: 90,
        },
    ];

    t.plan(test_cases.length);

    test_cases.forEach((tc, i) => {
        t.is(helpers.extractFinalPercent(tc.i), tc.o, `Convert to Final Percent, test case ${i + 1}`);
    });
});
