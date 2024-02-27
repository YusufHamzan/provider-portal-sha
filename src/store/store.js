import create from "zustand";
import produce from "immer";

export const useSnippetStore = create((set) => ({
    invoices: [],
    setInvoice: (name, data, id) => {
        if (name === "invoices") {
            set(() => ({ invoices: data }));
        } else if ("items") {
            set(
                produce((draft) => {
                    draft.invoices.forEach((item) => {
                        if (item.invoicenumber === data.invoicenumber) {
                            if (item.items.find((item) => item.id === id)) {
                                item.items.filter((item) => item.id === id)[0][data.field] = data.value;
                            } else {
                                item.items.push({ [data.field]: data.value, id: data.id });
                            }
                        } else {
                            void 0;
                        }
                    });
                })
            );
        }
    },
    removeSnippet: (id) =>
        set(
            produce((draft) => {
                draft.invoices.forEach((item) => {
                    item.items = item.items.filter((lineItem) => lineItem.id !== id);
                });
            })
        ),
}));
