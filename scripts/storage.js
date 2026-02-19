// storage.js — localStorage persistence layer for FinTrace

window.App = window.App || {};

(function(App) {
    const KEY = 'finance:data';

    const load = () => {
        const stored = localStorage.getItem(KEY);
        if (!stored) return [];
        try {
            return JSON.parse(stored) || [];
        } catch {
            console.error('FinTrace: Failed to parse stored data.');
            return [];
        }
    };

    const save = (data) => {
        localStorage.setItem(KEY, JSON.stringify(data));
    };

    App.Storage = { load, save };
})(window.App);