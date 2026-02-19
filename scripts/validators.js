// validators.js — Field validation rules and error messages for FinTrace

(function(App) {
    const rules = {
        description: /^\S(?:.*\S)?$|^[^ ]$/,
        amount:      /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        date:        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        category:    /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        advanced:    /\b(\w+)\s+\1\b/
    };

    function validateField(fieldName, value) {
        const regex = rules[fieldName];
        if (!regex) return false;
        if (fieldName === 'amount' && parseFloat(value) <= 0) return false;
        return regex.test(value);
    }

    function getErrorMessage(fieldName) {
        const messages = {
            description: 'Description required. No leading/trailing spaces.',
            amount:      'Enter a valid amount (> 0) with up to two decimal places.',
            date:        'Use date format YYYY-MM-DD.',
            category:    'Only letters, spaces, and hyphens allowed.',
            advanced:    'Description contains duplicate consecutive words.'
        };
        return messages[fieldName] || 'Invalid input.';
    }

    function validateRecordStructure(record) {
        const required = ['id', 'description', 'amount', 'category', 'date', 'createdAt', 'updatedAt'];
        if (!required.every(f => Object.prototype.hasOwnProperty.call(record, f))) return false;
        if (typeof record.amount !== 'number' || typeof record.id !== 'string') return false;
        if (!validateField('amount', record.amount.toString()) || !validateField('date', record.date)) return false;
        return true;
    }

    App.Validators = { rules, validateField, getErrorMessage, validateRecordStructure };
})(window.App);