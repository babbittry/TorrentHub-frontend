import { extendVariants, Input, Textarea } from "@heroui/react";

export const CustomInput = extendVariants(Input, {
    variants: {
        color: {
            custom: {
                inputWrapper: "bg-white border border-gray-300 hover:border-gray-400 data-[focus=true]:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 data-[focus=true]:dark:border-blue-500",
                input: "bg-transparent",
            },
        },
    },
    defaultVariants: {
        color: "custom",
    },
});

export const CustomTextarea = extendVariants(Textarea, {
    variants: {
        color: {
            custom: {
                inputWrapper: "bg-white border border-gray-300 hover:border-gray-400 data-[focus=true]:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 data-[focus=true]:dark:border-blue-500",
                input: "bg-transparent resize-y overflow-y-auto",
            },
        },
    },
    defaultVariants: {
        color: "custom",
    },
});
