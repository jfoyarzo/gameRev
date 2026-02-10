'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "@hello-pangea/dnd";
import { Save, RefreshCw, BookOpen, Star, GripVertical, Check, ExternalLink } from "lucide-react";
import { updatePreferences } from "@/lib/actions/preferences";
import { UserPreferences } from "@/lib/types/preferences";
import { AVAILABLE_ADAPTERS, AdapterName } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/** Homepage URL for each adapter source */
const SOURCE_HOMEPAGE: Record<AdapterName, string> = {
    IGDB: "https://www.igdb.com",
    RAWG: "https://rawg.io",
    OpenCritic: "https://opencritic.com",
};

interface SourcePreferenceFormProps {
    initialPreferences?: UserPreferences;
}

export function SourcePreferenceForm({ initialPreferences }: SourcePreferenceFormProps) {
    const router = useRouter();
    const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences || {
        preferredSources: {
            details: [...AVAILABLE_ADAPTERS],
            ratings: [...AVAILABLE_ADAPTERS],
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    const handleReorder = (type: 'details' | 'ratings', sourceIndex: number, destinationIndex: number) => {
        const currentList = [...(preferences.preferredSources?.[type] || [...AVAILABLE_ADAPTERS])];
        const [moved] = currentList.splice(sourceIndex, 1);
        currentList.splice(destinationIndex, 0, moved);

        const currentPreferred = preferences.preferredSources || {
            details: [...AVAILABLE_ADAPTERS],
            ratings: [...AVAILABLE_ADAPTERS]
        };

        setPreferences({
            ...preferences,
            preferredSources: {
                details: currentPreferred.details,
                ratings: currentPreferred.ratings,
                [type]: currentList,
            }
        });
    };

    const handleToggle = (type: 'details' | 'ratings', source: AdapterName) => {
        const currentList = preferences.preferredSources?.[type] || [...AVAILABLE_ADAPTERS];
        let newList: AdapterName[];

        if (currentList.includes(source)) {
            newList = currentList.filter(s => s !== source);
        } else {
            newList = [...currentList, source];
        }

        const currentPreferred = preferences.preferredSources || {
            details: [...AVAILABLE_ADAPTERS],
            ratings: [...AVAILABLE_ADAPTERS]
        };

        setPreferences({
            ...preferences,
            preferredSources: {
                details: currentPreferred.details,
                ratings: currentPreferred.ratings,
                [type]: newList,
            }
        });
    };

    const onSave = async () => {
        setIsSaving(true);
        setSavedSuccess(false);
        try {
            await updatePreferences(preferences);
            setSavedSuccess(true);
            router.refresh();
            setTimeout(() => setSavedSuccess(false), 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
                <SourceSection
                    type="details"
                    title="Details Sources"
                    description="Controls which sources provide descriptions, screenshots, and cover images on game pages."
                    icon={<BookOpen className="h-4 w-4" />}
                    preferences={preferences}
                    onToggle={handleToggle}
                    onReorder={handleReorder}
                />

                <SourceSection
                    type="ratings"
                    title="Ratings Sources"
                    description="Controls which sources appear in the rating breakdown section on game pages."
                    icon={<Star className="h-4 w-4" />}
                    preferences={preferences}
                    onToggle={handleToggle}
                    onReorder={handleReorder}
                />
            </div>

            <div className="sticky bottom-0 py-4 bg-background/95 backdrop-blur-sm border-t -mx-4 px-4">
                <div className="flex items-center justify-between max-w-4xl">
                    <p className="text-xs text-muted-foreground">
                        Changes are applied after saving.
                    </p>
                    <Button onClick={onSave} disabled={isSaving} size="lg" className="min-w-[160px]">
                        {isSaving ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : savedSuccess ? (
                            <Check className="mr-2 h-4 w-4" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {savedSuccess ? "Saved!" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** Reusable section for a single preference category (details or ratings) */
function SourceSection({
    type,
    title,
    description,
    icon,
    preferences,
    onToggle,
    onReorder,
}: {
    type: 'details' | 'ratings';
    title: string;
    description: string;
    icon: React.ReactNode;
    preferences: UserPreferences;
    onToggle: (type: 'details' | 'ratings', source: AdapterName) => void;
    onReorder: (type: 'details' | 'ratings', sourceIndex: number, destinationIndex: number) => void;
}) {
    const enabledList = preferences.preferredSources?.[type] || [];
    const disabledList = AVAILABLE_ADAPTERS.filter(s => !enabledList.includes(s));

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        onReorder(type, result.source.index, result.destination.index);
    };

    return (
        <div className="rounded-xl border bg-card/50 overflow-hidden">
            <div className="px-5 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary">{icon}</span>
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {description}
                </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`${type}-list`}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-3 space-y-2 transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-primary/5" : ""
                                }`}
                        >
                            {enabledList.map((source, index) => (
                                <Draggable
                                    key={source}
                                    draggableId={`${type}-${source}`}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            data-testid={`source-${type}-${source}`}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-shadow duration-200 ${snapshot.isDragging
                                                ? "bg-card border-primary/30 shadow-lg ring-1 ring-primary/20"
                                                : "bg-card border-border shadow-sm"
                                                }`}
                                        >
                                            <div
                                                {...provided.dragHandleProps}
                                                className="flex items-center gap-2 shrink-0 cursor-grab active:cursor-grabbing"
                                            >
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                            </div>

                                            {/* Source Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Label className="font-medium text-sm">
                                                        {source}
                                                    </Label>
                                                    <a
                                                        href={SOURCE_HOMEPAGE[source]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground/50 hover:text-primary transition-colors"
                                                        title={`Visit ${source} website`}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                <Switch
                                                    checked
                                                    onCheckedChange={() => onToggle(type, source)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {disabledList.length > 0 && (
                <div className="px-3 pb-3 space-y-2">
                    {disabledList.map((source) => (
                        <div
                            key={source}
                            data-testid={`source-${type}-${source}`}
                            className="flex items-center gap-3 p-3 rounded-lg border-transparent bg-muted/20 opacity-60"
                        >
                            <div className="shrink-0 ml-1">
                                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Label className="font-medium text-sm text-muted-foreground">
                                        {source}
                                    </Label>
                                    <a
                                        href={SOURCE_HOMEPAGE[source]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground/30 hover:text-primary transition-colors"
                                        title={`Visit ${source} website`}
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Switch
                                    checked={false}
                                    onCheckedChange={() => onToggle(type, source)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
