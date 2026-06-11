import {useRef, useState} from "react";

// @ts-ignore
import { Accordion, AccordionItem, AccordionProps } from "phoenix-react-lib";
import {
    CargoDetails, CustomDetails, CustomerDetails, DocumentDetails, DocumentStatusIcon, LCLRoutingPage,
    LocationInformation, MainDetailsSection, RateDetails,
    RateDetailsIcon,
    ToolBar,
    mapMainDetailsToBookingQuoteBean,
    mapDocumentDetailsToUploadDocumentBeans,
    type FormState,
    type MainDetailsFormPayload,
    type DocumentUploadFormData,
} from "phoenix-common-react";

interface ProgressConfig {
    currentValue: number;
    fieldPriority: number;
}

interface StackState {
    progressConfig: ProgressConfig;
    fieldFilledMap: Record<string, boolean>;
}


const calcProgress = (filledCount: number, fieldPriority: number): number =>
    Math.min(100, (filledCount * fieldPriority) | 0);

const getValueByPath = (obj: any, path: string) =>
    path.split(".").reduce((acc: any, key: string) => acc?.[key], obj);

export default function BookingLCL() {
    const accordionIds = [
        "mainDetails",
        "documentDetails",
        "customerDetails",
        "routingDetails",
        "cargoDetails",
        "customDetails",
        "rateDetails",
        "locationInformation",
    ];
    const accordionIndexIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const [openItems, setOpenItems] = useState<string[]>(accordionIndexIds);
    const [stackStateMap, setStackStateMap] = useState<Record<string, StackState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAllOpen, setIsAllOpen] = useState(true);
    const dataRef = useRef<Record<string, unknown>>({});
    const [mainDetailsValue, setMainDetailsValue] = useState<Partial<FormState> | undefined>(undefined);
    const [documentDetailsValue, setDocumentDetailsValue] = useState<DocumentUploadFormData[] | undefined>(undefined);

    const handleFieldChange = (stackId: string, value: boolean, field: string) => {
        setStackStateMap(prev => {
            const stack = prev[stackId];
            if (!stack) return prev;
            if (!(field in stack.fieldFilledMap)) return prev;
            if (stack.fieldFilledMap[field] === value) return prev;
            const newFieldFilledMap = { ...stack.fieldFilledMap, [field]: value };
            const filledCount = Object.values(newFieldFilledMap).filter(Boolean).length;
            return {
                ...prev,
                [stackId]: {
                    progressConfig: {
                        fieldPriority: stack.progressConfig.fieldPriority,
                        currentValue: calcProgress(filledCount, stack.progressConfig.fieldPriority),
                    },
                    fieldFilledMap: newFieldFilledMap,
                },
            };
        });
    };

    const handleFieldsChange = (stackId: string, formData: any) => {
        dataRef.current = {...dataRef.current, [stackId]: formData};
        const fields = Object.keys(stackStateMap[stackId]?.fieldFilledMap ?? {});
        if (!fields.length) return;
        fields.forEach((fieldPath) => {
            const value = getValueByPath(formData, fieldPath);
            if (!!value) {
                handleFieldChange(stackId, true, fieldPath);
            } else {
                handleFieldChange(stackId, false, fieldPath);
            }
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const mainDetails = dataRef.current.mainDetails as MainDetailsFormPayload | undefined;
            const documentDetails = dataRef.current.documentDetails as DocumentUploadFormData[] | undefined;
            const bookingQuoteBean = {
                ...mapMainDetailsToBookingQuoteBean(mainDetails),
                uploadDocumentsBeanList: mapDocumentDetailsToUploadDocumentBeans(documentDetails, {
                    referenceNumber: mainDetails?.referenceNumber?.toString() ?? "",
                    referenceObject: "BKG",
                }),
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const registerFields = (stackId: string, fields: string[]) => {
        if (fields.length === 0) {
            setStackStateMap(prev => ({
                ...prev,
                [stackId]: {progressConfig: {currentValue: 0, fieldPriority: 0}, fieldFilledMap: {}},
            }));
            return;
        }
        setStackStateMap(prev => {
            const existingFilled = prev[stackId]?.fieldFilledMap ?? {};
            const newFieldFilledMap = Object.fromEntries(fields.map(f => [f, existingFilled[f] ?? false]));
            const fieldPriority = 100 / fields.length;
            const filledCount = Object.values(newFieldFilledMap).filter(Boolean).length;
            return {
                ...prev,
                [stackId]: {
                    progressConfig: {currentValue: calcProgress(filledCount, fieldPriority), fieldPriority},
                    fieldFilledMap: newFieldFilledMap,
                },
            };
        });
    };

    const progressOf = (stackId: string) => stackStateMap[stackId]?.progressConfig.currentValue ?? 0;

    const accordionItems: AccordionItem[] = [
        {
            id: accordionIds[0],
            label: "Main Details",
            content: <MainDetailsSection
                    onRegisterFields={(fields) => registerFields("mainDetails", fields)}
                    onFieldsChange={(formData) => handleFieldsChange("mainDetails", formData)}
                    value={mainDetailsValue}
                />,
            progress: true,
            icon: false,
            progressValue: progressOf("mainDetails"),
        },
        {
            id: accordionIds[1],
            label: "Document Details",
            content: <DocumentDetails
                onRegisterFields={(fields) => registerFields("documentDetails", fields)}
                onFieldsChange={(formData) => handleFieldsChange("documentDetails", formData)}
                value={documentDetailsValue}
            />,
            progress: true,
            icon: true,
            progressValue: 100,
            iconContent: <DocumentStatusIcon/>
        },
        {
            id: accordionIds[2],
            label: "Customer Details",
            content: <CustomerDetails
                    onRegisterFields={(fields) => registerFields("customerDetails", fields)}
                    onFieldsChange={(formData) => handleFieldsChange("customerDetails", formData)}
                />,
            progress: true,
            icon: false,
            progressValue: progressOf("customerDetails"),
        },
        {
            id: accordionIds[3],
            label: "Routing Details",
            content: <LCLRoutingPage/>,
            progress: true,
            icon: false,
            progressValue: progressOf("routingDetails"),
            fieldFilledMap: {},
        },
        {
            id: accordionIds[4],
            label: "Cargo Details",
            content:
                <CargoDetails
                    onRegisterFields={(fields) => registerFields("cargoDetails", fields)}
                    onFieldsChange={(formData) => handleFieldsChange("cargoDetails", formData)}
                />,
            progress: true,
            icon: false,
            progressValue: progressOf("cargoDetails"),
        },
        {
            id: accordionIds[5],
            label: "Custom Details",
            content: <CustomDetails
                    onRegisterFields={(fields) => registerFields("customDetails", fields)}
                    onFieldsChange={(formData) => handleFieldsChange("customDetails", formData)}
                />,
            progress: true,
            icon: false,
            progressValue: progressOf("customDetails"),
        },
        {
            id: accordionIds[6],
            label: "Rate Details",
            content: <RateDetails
                    moduleType="LCL"
                    onRegisterFields={(fields) => registerFields("rateDetails", fields)}
                    onFieldsChange={(formData) => handleFieldsChange("rateDetails", formData)}
                />,
            progress: true,
            icon: true,
            progressValue: progressOf("rateDetails"),
            iconContent: <RateDetailsIcon/>
        },
        {
            id: accordionIds[7],
            label: "Location Information",
            content: <LocationInformation />,
            progress: true,
            icon: false,
            progressValue: 100,
        },
    ];

    const allAccordionIds = accordionIndexIds;

    const toggleItem = (id: string) => {
        setOpenItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleAllItems = () => {
        if (isAllOpen) {
            setOpenItems([]);
            setIsAllOpen(false);
            return;
        }
        setOpenItems(allAccordionIds);
        setIsAllOpen(true);
    };

    const accordionProps: AccordionProps = {
        accordionData: accordionItems,
        openItems: openItems,
        toggleItem: toggleItem,
    };

    return (
        <>
            <ToolBar
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onToggleAll={toggleAllItems}
                isAllOpen={isAllOpen}
            />
            {/*@ts-ignore*/}
            <Accordion
                {...accordionProps}
            />
        </>
    );
}
