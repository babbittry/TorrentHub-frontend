"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { admin, SiteSettingsDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define the schema based on SiteSettingsDto
const siteSettingsSchema = z.object({
    // 1. 基础设置 (General)
    siteName: z.string().min(1, "Site name is required"),
    logoUrl: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable().or(z.literal("")),

    // 2. 注册设置 (Registration)
    isRegistrationOpen: z.boolean(),

    // 3. 功能开关 (Features)
    isRequestSystemEnabled: z.boolean(),
    isForumEnabled: z.boolean(),

    // 4. Tracker设置 (Tracker)
    trackerUrl: z.string().url("Invalid URL"),
    announceIntervalSeconds: z.coerce.number().min(300),
    globalFreeleechEnabled: z.boolean(),

    // 5. Announce间隔控制
    minAnnounceIntervalSeconds: z.coerce.number().min(60),
    enforcedMinAnnounceIntervalSeconds: z.coerce.number().min(30),

    // 6. 多地点检测 (Multi-Location Detection)
    enableMultiLocationDetection: z.boolean(),
    multiLocationDetectionWindowMinutes: z.coerce.number().min(1),
    logMultiLocationCheating: z.boolean(),

    // 7. IP变更容忍 (IP Change Tolerance)
    allowIpChange: z.boolean(),
    minIpChangeIntervalMinutes: z.coerce.number().min(1),

    // 8. 速度限制 (Speed Limits)
    maxUploadSpeed: z.coerce.number().min(0),
    maxDownloadSpeed: z.coerce.number().min(0),

    // 9. 速度检查配置
    minSpeedCheckIntervalSeconds: z.coerce.number().min(5),
    enableDownloadSpeedCheck: z.boolean(),

    // 10. 作弊检测 (Cheat Detection)
    cheatWarningAnnounceThreshold: z.coerce.number().min(1),
    autoBanAfterCheatWarnings: z.coerce.number().min(0),

    // 11. 凭证清理 (Credential Cleanup)
    credentialCleanupDays: z.coerce.number().min(1),
    enableCredentialAutoCleanup: z.boolean(),

    // 12. 金币系统 (Coins)
    invitePrice: z.coerce.number().min(0),
    inviteExpirationDays: z.coerce.number().min(1),
    createRequestCost: z.coerce.number().min(0),
    fillRequestBonus: z.coerce.number().min(0),
    commentBonus: z.coerce.number().min(0),
    uploadTorrentBonus: z.coerce.number().min(0),
    maxDailyCommentBonuses: z.coerce.number().min(0),
    tipTaxRate: z.coerce.number().min(0).max(1),
    transferTaxRate: z.coerce.number().min(0).max(1),

    // 13. 种子设置 (Torrents)
    torrentStoragePath: z.string().min(1),
    maxTorrentSize: z.coerce.number().min(1024),

    // 14. 金币生成系统 (Coin Generation)
    generationIntervalMinutes: z.coerce.number().min(1),
    baseGenerationRate: z.coerce.number().min(0),
    sizeFactorMultiplier: z.coerce.number().min(0),
    mosquitoFactorMultiplier: z.coerce.number().min(0),
    seederFactorMultiplier: z.coerce.number().min(0),

    // 15. 内容审核 (Content Moderation)
    contentEditWindowMinutes: z.coerce.number().min(1),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SiteSettingsFormValues = any;

export default function SiteSettingsPage() {
    const t = useTranslations("Admin.siteSettings");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SiteSettingsFormValues>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: {
            siteName: "",
            logoUrl: "",
            contactEmail: "",
            isRegistrationOpen: false,
            isRequestSystemEnabled: true,
            isForumEnabled: true,
            trackerUrl: "",
            announceIntervalSeconds: 1800,
            globalFreeleechEnabled: false,
            minAnnounceIntervalSeconds: 900,
            enforcedMinAnnounceIntervalSeconds: 180,
            enableMultiLocationDetection: true,
            multiLocationDetectionWindowMinutes: 5,
            logMultiLocationCheating: true,
            allowIpChange: true,
            minIpChangeIntervalMinutes: 10,
            maxUploadSpeed: 128000,
            maxDownloadSpeed: 128000,
            minSpeedCheckIntervalSeconds: 5,
            enableDownloadSpeedCheck: true,
            cheatWarningAnnounceThreshold: 20,
            autoBanAfterCheatWarnings: 10,
            credentialCleanupDays: 90,
            enableCredentialAutoCleanup: true,
            invitePrice: 5000,
            inviteExpirationDays: 30,
            createRequestCost: 1000,
            fillRequestBonus: 500,
            commentBonus: 10,
            uploadTorrentBonus: 250,
            maxDailyCommentBonuses: 10,
            tipTaxRate: 0.1,
            transferTaxRate: 0.05,
            torrentStoragePath: "torrents",
            maxTorrentSize: 10737418240, // 10GB
            generationIntervalMinutes: 60,
            baseGenerationRate: 1.0,
            sizeFactorMultiplier: 0.5,
            mosquitoFactorMultiplier: 0.1,
            seederFactorMultiplier: 0.2,
            contentEditWindowMinutes: 15,
        },
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await admin.getSiteSettings();
                // Ensure all fields are present and have correct types
                form.reset({
                    ...settings,
                    logoUrl: settings.logoUrl || "",
                    contactEmail: settings.contactEmail || "",
                });
            } catch (error) {
                console.error("Failed to load site settings:", error);
                toast.error(t("loadError"));
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [form, t]);

    const onSubmit = async (data: SiteSettingsFormValues) => {
        setIsSaving(true);
        try {
            // Convert empty strings to null for optional fields
            const payload: SiteSettingsDto = {
                ...data,
                logoUrl: data.logoUrl || null,
                contactEmail: data.contactEmail || null,
            };
            await admin.updateSiteSettings(payload);
            toast.success(t("saveSuccess"));
        } catch (error) {
            console.error("Failed to save site settings:", error);
            toast.error(t("saveError"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-4">
                            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("tabs.general")}</TabsTrigger>
                            <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("tabs.features")}</TabsTrigger>
                            <TabsTrigger value="tracker" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("tabs.tracker")}</TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("tabs.security")}</TabsTrigger>
                            <TabsTrigger value="economy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("tabs.economy")}</TabsTrigger>
                            <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("tabs.content")}</TabsTrigger>
                        </TabsList>

                        {/* 1. General Settings */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("sections.general")}</CardTitle>
                                    <CardDescription>{t("sections.generalDesc")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="siteName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("fields.siteName")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="logoUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("fields.logoUrl")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("fields.contactEmail")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 2. Features & Registration */}
                        <TabsContent value="features">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("sections.features")}</CardTitle>
                                    <CardDescription>{t("sections.featuresDesc")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="isRegistrationOpen"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">{t("fields.isRegistrationOpen")}</FormLabel>
                                                    <FormDescription>{t("fields.isRegistrationOpenDesc")}</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isRequestSystemEnabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">{t("fields.isRequestSystemEnabled")}</FormLabel>
                                                    <FormDescription>{t("fields.isRequestSystemEnabledDesc")}</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isForumEnabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">{t("fields.isForumEnabled")}</FormLabel>
                                                    <FormDescription>{t("fields.isForumEnabledDesc")}</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 3. Tracker Settings */}
                        <TabsContent value="tracker">
                            <div className="grid gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.trackerConfig")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="trackerUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.trackerUrl")}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="announceIntervalSeconds"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.announceIntervalSeconds")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="minAnnounceIntervalSeconds"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.minAnnounceIntervalSeconds")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="enforcedMinAnnounceIntervalSeconds"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.enforcedMinAnnounceIntervalSeconds")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="globalFreeleechEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">{t("fields.globalFreeleechEnabled")}</FormLabel>
                                                        <FormDescription>{t("fields.globalFreeleechEnabledDesc")}</FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.speedLimits")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="maxUploadSpeed"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.maxUploadSpeed")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormDescription>KB/s</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="maxDownloadSpeed"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.maxDownloadSpeed")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormDescription>KB/s</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="enableDownloadSpeedCheck"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">{t("fields.enableDownloadSpeedCheck")}</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="minSpeedCheckIntervalSeconds"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.minSpeedCheckIntervalSeconds")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* 4. Security & Anti-Cheat */}
                        <TabsContent value="security">
                            <div className="grid gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.multiLocation")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="enableMultiLocationDetection"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">{t("fields.enableMultiLocationDetection")}</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="logMultiLocationCheating"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">{t("fields.logMultiLocationCheating")}</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="multiLocationDetectionWindowMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.multiLocationDetectionWindowMinutes")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.ipChange")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="allowIpChange"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">{t("fields.allowIpChange")}</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="minIpChangeIntervalMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.minIpChangeIntervalMinutes")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.cheatDetection")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="cheatWarningAnnounceThreshold"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.cheatWarningAnnounceThreshold")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="autoBanAfterCheatWarnings"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.autoBanAfterCheatWarnings")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.credentialCleanup")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="enableCredentialAutoCleanup"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">{t("fields.enableCredentialAutoCleanup")}</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="credentialCleanupDays"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.credentialCleanupDays")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* 5. Economy & Coins */}
                        <TabsContent value="economy">
                            <div className="grid gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.economy")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="invitePrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.invitePrice")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="inviteExpirationDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.inviteExpirationDays")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="createRequestCost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.createRequestCost")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fillRequestBonus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.fillRequestBonus")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="commentBonus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.commentBonus")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="maxDailyCommentBonuses"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.maxDailyCommentBonuses")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="uploadTorrentBonus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.uploadTorrentBonus")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="tipTaxRate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.tipTaxRate")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" {...field} />
                                                        </FormControl>
                                                        <FormDescription>0.1 = 10%</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="transferTaxRate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.transferTaxRate")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" {...field} />
                                                        </FormControl>
                                                        <FormDescription>0.05 = 5%</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.coinGeneration")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="generationIntervalMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.generationIntervalMinutes")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="baseGenerationRate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.baseGenerationRate")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="sizeFactorMultiplier"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.sizeFactorMultiplier")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="mosquitoFactorMultiplier"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.mosquitoFactorMultiplier")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="seederFactorMultiplier"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("fields.seederFactorMultiplier")}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* 6. Content & Torrents */}
                        <TabsContent value="content">
                            <div className="grid gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.torrents")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="torrentStoragePath"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.torrentStoragePath")}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="maxTorrentSize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.maxTorrentSize")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Bytes</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("sections.moderation")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="contentEditWindowMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("fields.contentEditWindowMinutes")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("save")}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
