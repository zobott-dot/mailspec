// app/utils/compliance.js
// USPS self-mailer compliance evaluation for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Compliance = {

        /**
         * Evaluate self-mailer tab compliance against DMM 201.3.14.
         *
         * @param {Object} params
         * @param {string} params.foldType - '1' (flat/postcard), '2' (bi-fold), '3' (tri-fold), '4' (quarter-fold)
         * @param {number} params.totalWeightOz - Assembly total weight in ounces (after buffers/seals)
         * @param {string} params.sealType - 'none', 'wafer', 'glue_dot', 'line_glue'
         * @param {number} params.sealQty - Number of seals/tabs
         * @param {boolean} params.hasOptionalElements - Whether piece has die-cuts, perforations, etc.
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

            // Only evaluate folded self-mailers (bi-fold, tri-fold, quarter-fold)
            var foldType = params.foldType;
            if (foldType === '1') {
                // Flat/postcard — no tab requirements (postcards have different rules)
                result.status = 'na';
                result.messages.push('Flat piece — tab standards do not apply.');
                return result;
            }

            var weight = params.totalWeightOz;
            var sealType = params.sealType;
            var sealQty = params.sealQty;
            var hasOptional = params.hasOptionalElements;
            var isQuarterFold = (foldType === '4');

            // Check maximum weight
            if (weight > 3.0) {
                result.status = 'fail';
                result.messages.push('Weight ' + weight.toFixed(3) + ' oz exceeds 3 oz maximum for folded self-mailers.');
                return result;
            }

            // Determine required tabs and size
            var reqTabs = 2;
            var reqSize = '1"';

            if (weight > 1.0) {
                reqSize = '1.5"';
                if (isQuarterFold) {
                    reqTabs = 3;
                }
            } else {
                reqSize = '1"';
            }

            // Optional design elements add a third tab
            if (hasOptional && reqTabs < 3) {
                reqTabs = 3;
            }

            // Quarter-fold over 1oz always needs 3
            if (isQuarterFold && weight > 1.0) {
                reqTabs = 3;
                reqSize = '1.5"';
            }

            result.requiredTabs = reqTabs;
            result.requiredSize = reqSize;

            // Evaluate current seal configuration
            if (sealType === 'none' || sealQty === 0) {
                result.status = 'fail';
                result.messages.push('No seals configured. Minimum ' + reqTabs + ' tabs (' + reqSize + ') required.');
                result.messages.push('Set seal type and quantity in Global Adjustments.');
                return result;
            }

            // Line glue is acceptable as an alternative closure
            if (sealType === 'line_glue') {
                result.status = 'pass';
                result.messages.push('Line glue is an acceptable closure method for folded self-mailers.');
                if (sealQty < 2) {
                    result.status = 'caution';
                    result.messages = ['Line glue configured but quantity is ' + sealQty + '. Verify continuous glue coverage along open edge.'];
                }
                return result;
            }

            // Evaluate tab quantity
            if (sealQty >= reqTabs) {
                result.status = 'pass';
                result.messages.push(sealQty + ' tab(s) configured. Requirement: ' + reqTabs + ' minimum (' + reqSize + ').');
            } else {
                result.status = 'fail';
                result.messages.push(sealQty + ' tab(s) configured but ' + reqTabs + ' required (' + reqSize + ').');
                result.messages.push('Increase seal quantity in Global Adjustments.');
            }

            // Size advisory for wafer tabs
            if (sealType === 'wafer' && reqSize === '1.5"') {
                result.messages.push('Verify wafer tabs are 1.5" diameter (standard wafers are 1").');
            }

            // Glue dot advisory
            if (sealType === 'glue_dot') {
                result.messages.push('Glue dots: minimum 3/8" diameter, placed within 3/4" of open edges.');
            }

            return result;
        }
    };
})();
