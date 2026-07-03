// app/utils/compliance.js
// USPS self-mailer compliance evaluation for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Compliance = {

        /**
         * Evaluate self-mailer tab compliance against DMM 201.3.14.
         *
         * @param {Object} params
         * @param {string} params.foldType - '1' (flat/postcard), '2' (bi-fold), '3' (tri-fold), '4' (quarter-fold), 'specialty' (gate/double-gate/iron-cross)
         * @param {number} params.totalWeightOz - Assembly total weight in ounces (after buffers/seals)
         * @param {string} params.sealType - 'none', 'wafer', 'glue_dot', 'line_glue', 'perf_tab'
         * @param {number} params.sealQty - Number of seals/tabs
         * @param {boolean} params.hasOptionalElements - Whether piece has die-cuts, perforations, etc.
         * @param {number} [params.finishedW] - Finished piece width (in)
         * @param {number} [params.finishedH] - Finished piece height (in)
         * @param {number} [params.stockGsm] - GSM of the self-mailer's stock (omit/undefined = skip paper check)
         * @returns {Object} { status, requiredTabs, requiredSize, messages, reference }
         *   status: 'pass' | 'caution' | 'fail' | 'na'
         *   requiredTabs: number
         *   requiredSize: string (e.g., '1"', '1.5"')
         *   messages: string[] - Array of specific messages
         *   reference: string - DMM section reference
         */
        evaluateSelfMailer: function(params) {
            var result = {
                status: 'na',
                requiredTabs: 0,
                requiredSize: '',
                messages: [],
                reference: 'DMM 201.3.14'
            };

            var foldType = params.foldType;
            var isSpecialty = (foldType === 'specialty');

            // Flat/postcard with no specialty flag — tab standards do not apply
            if (foldType === '1') {
                result.status = 'na';
                result.messages.push('Flat piece — tab standards do not apply.');
                return result;
            }

            var weight = params.totalWeightOz;
            var sealType = params.sealType;
            var sealQty = params.sealQty;
            var hasOptional = params.hasOptionalElements;

            // Maximum weight
            if (weight > 3.0) {
                result.status = 'fail';
                result.messages.push('Weight ' + weight.toFixed(3) + ' oz exceeds 3 oz maximum for folded self-mailers.');
                return result;
            }

            // Size gate — DMM 201.3.14 max is 6" × 10.5" (smaller than the letter maximum)
            var longDim = Math.max(params.finishedW || 0, params.finishedH || 0);
            var shortDim = Math.min(params.finishedW || 0, params.finishedH || 0);
            if (longDim > 0 && shortDim > 0 && (longDim > 10.5 || shortDim > 6)) {
                result.status = 'fail';
                result.messages.push('Finished size ' + longDim.toFixed(3) + '" × ' + shortDim.toFixed(3) + '" exceeds the folded self-mailer maximum of 6" × 10.5" (the FSM limit is smaller than the 6.125" × 11.5" letter maximum).');
                return result;
            }

            // Paper minimum — record failure but continue so tab evaluation still renders
            if (typeof params.stockGsm === 'number' && params.stockGsm > 0) {
                var minGsm, minLabel;
                if (hasOptional) {
                    minGsm = 148;
                    minLabel = '100# book';
                } else if (weight > 1.0) {
                    minGsm = 118;
                    minLabel = '80# book';
                } else {
                    minGsm = 104;
                    minLabel = '70# book';
                }
                if (params.stockGsm < minGsm) {
                    result.status = 'fail';
                    result.messages.push('Stock ' + params.stockGsm + ' gsm is below the ' + minGsm + ' gsm minimum (' + minLabel + ' equivalent) required for this fold/weight/optional-element combination.');
                }
            }

            // Perforated tabs are prohibited by DMM 201.3.14
            if (sealType === 'perf_tab') {
                result.status = 'fail';
                result.messages.push('Perforated tabs are not permitted as a closure for folded self-mailers — DMM 201.3.14 requires tabs free of perforations. Use wafer tabs or glue.');
                if (isSpecialty) {
                    result.messages.push('Specialty fold — gate, double-gate, and iron-cross formats carry additional closure and final-fold requirements. Verify tab placement and orientation with an MDA before production.');
                }
                return result;
            }

            // Required tabs and size
            var reqTabs = 2;
            var reqSize = (weight > 1.0) ? '1.5"' : '1"';

            if (hasOptional) {
                reqTabs = 2;
                reqSize = '1.5"';
            }

            result.requiredTabs = reqTabs;
            result.requiredSize = reqSize;

            var paperAlreadyFailed = (result.status === 'fail');

            // Evaluate seal configuration
            if (sealType === 'none' || sealQty === 0) {
                result.status = 'fail';
                result.messages.push('No seals configured. Minimum ' + reqTabs + ' tabs (' + reqSize + ') required.');
                result.messages.push('Set seal type and quantity in Global Adjustments.');
                if (isSpecialty) {
                    result.messages.push('Specialty fold — gate, double-gate, and iron-cross formats carry additional closure and final-fold requirements. Verify tab placement and orientation with an MDA before production.');
                }
                return result;
            }

            // Line glue: acceptable alternative closure (including when optional elements are present)
            if (sealType === 'line_glue') {
                if (!paperAlreadyFailed) result.status = 'pass';
                result.messages.push('Line glue is an acceptable closure method for folded self-mailers.');
                if (sealQty < 2) {
                    if (!paperAlreadyFailed) result.status = 'caution';
                    result.messages.push('Line glue configured but quantity is ' + sealQty + '. Verify continuous glue coverage along open edge.');
                }
                if (isSpecialty) {
                    result.messages.push('Specialty fold — gate, double-gate, and iron-cross formats carry additional closure and final-fold requirements. Verify tab placement and orientation with an MDA before production.');
                }
                return result;
            }

            // Glue dots: 3 spots <= 1 oz, 4 spots > 1 oz
            if (sealType === 'glue_dot') {
                var reqGlueSpots = (weight > 1.0) ? 4 : 3;
                if (sealQty >= reqGlueSpots) {
                    if (!paperAlreadyFailed) result.status = 'pass';
                    result.messages.push(sealQty + ' glue spot(s) configured. Requirement: ' + reqGlueSpots + ' minimum.');
                } else {
                    result.status = 'fail';
                    result.messages.push(sealQty + ' glue spot(s) configured but ' + reqGlueSpots + ' required.');
                }
                result.messages.push('Glue dots: minimum 3/8" diameter, placed within 3/4" of open edges.');
                if (isSpecialty) {
                    result.messages.push('Specialty fold — gate, double-gate, and iron-cross formats carry additional closure and final-fold requirements. Verify tab placement and orientation with an MDA before production.');
                }
                return result;
            }

            // Wafer / generic tab evaluation
            if (sealQty >= reqTabs) {
                if (!paperAlreadyFailed) result.status = 'pass';
                result.messages.push(sealQty + ' tab(s) configured. Requirement: ' + reqTabs + ' minimum (' + reqSize + ').');
            } else {
                result.status = 'fail';
                result.messages.push(sealQty + ' tab(s) configured but ' + reqTabs + ' required (' + reqSize + ').');
                result.messages.push('Increase seal quantity in Global Adjustments.');
            }

            if (sealType === 'wafer' && reqSize === '1.5"') {
                result.messages.push('Verify wafer tabs are 1.5" diameter (standard wafers are 1").');
            }

            if (isSpecialty) {
                result.messages.push('Specialty fold — gate, double-gate, and iron-cross formats carry additional closure and final-fold requirements. Verify tab placement and orientation with an MDA before production.');
            }

            return result;
        }
    };
})();
