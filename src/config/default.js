module.exports = {
    branchProtection: {
        required_status_checks: {
            contexts: [],
            strict: true,
        },
        enforce_admins: true,
        required_pull_request_reviews: {
            dismiss_stale_reviews: true,
            required_approving_review_count: 1,
        },
        required_linear_history: true,
        allow_force_pushes: false,
        allow_deletions: false,
        required_conversation_resolution: true,
        // eslint-disable-next-line unicorn/no-null -- This has to be null so the attribute exists within the request payload that is sent to GitHub
        restrictions: null,
    },
    repositoryWhitelist: [],
};
