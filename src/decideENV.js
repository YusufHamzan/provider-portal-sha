const isBrowser = typeof window !== "undefined";

export const decideENV = () => {
    if (isBrowser) {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "DEV";
        } else {
            return "PROD";
        }
    }
};
