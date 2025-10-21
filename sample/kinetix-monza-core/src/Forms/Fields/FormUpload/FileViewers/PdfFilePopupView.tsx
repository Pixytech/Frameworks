import { FC } from "react";
import { PdfFilePopup } from "./PdfFilePopup";
import "./PdfFilePopup.scss";
import { useViewModelInstance } from "@kinetix/core";
import { TicketLayout } from "../../../TicketLayout";
import { FormPdfViewer } from "../../PdfViewer/FormPdfViewer";

export interface IPdfFilePopupViewProps {
    dataContext: PdfFilePopup;
}

export const PdfFilePopupView: FC<IPdfFilePopupViewProps> = (props: IPdfFilePopupViewProps) => 
    {
        const dataContext  = useViewModelInstance(props.dataContext);
        return <TicketLayout viewModel={dataContext} >
            <FormPdfViewer dataContext={dataContext.pdfViewer} />   
        </TicketLayout>
    }