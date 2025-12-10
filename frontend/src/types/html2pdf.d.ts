declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      backgroundColor?: string;
      logging?: boolean;
    };
    jsPDF?: {
      unit?: string;
      format?: string | number[];
      orientation?: 'portrait' | 'landscape';
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: Element | string): Html2PdfInstance;
    save(): Promise<void>;
    toPdf(): Html2PdfInstance;
    get(type: string): Promise<any>;
    output(type: string, options?: any): Promise<any>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: Element, options?: Html2PdfOptions): Html2PdfInstance;

  export = html2pdf;
}