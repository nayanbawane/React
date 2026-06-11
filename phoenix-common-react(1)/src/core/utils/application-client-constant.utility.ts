// Application-wide constants for the React client.

export const DEFAULT_LOCALE = 'en';
export const APP_NAME = 'phoenix';
export const EMPTY_STRING = '';
export const BLANK_STRING = ' ';
export const COMMA = ',';
export const PLEASE_SELECT = 'Please Select';

export const DATE_FORMAT = 'DD-MMM-YYYY';           // e.g. 20-MAR-2026
export const DATE_TIME_FORMAT = 'ddd,DD-MMM-YYYY HH:mm:ss';
export const DATE_TIME_FORMAT_SAILING_SCHEDULE = 'ddd DD MMM YYYY';

export const YES = 'Y';
export const NO = 'N';
export const YES_VALUE = 'Yes';
export const NO_VALUE = 'No';

export const BILLOFLADING = 'BOL';
export const BOOKING = 'BKG';
export const QUOTE = 'QUO';
export const ARRIVALNOTICE = 'ARN';
export const LOADPLANNIG = 'LDP';

export const MODULE_BOL = 'BOL';
export const MODULE_BKG = 'BKG';
export const MODULE_PREBKG = 'PREBKG';
export const MODULE_QUO = 'QUO';
export const MODULE_MBKG = 'MBKG';
export const MODULE_MENU = 'MNU';
export const MODULE_FLS = 'FLS';
export const MODULE_LOT = 'LOT';
export const MODULE_CAP = 'LDP';
export const MODULE_ARN = 'ARN';
export const MODULE_TOOLS = 'TOOLS';
export const MODULE_SEARCH = 'SEARCH';
export const MODULE_ADMIN = 'ADMIN';
export const MODULE_DSHB = 'MNU';
export const REPORT = 'REPORT';
export const MODULE_ACCOUNTING = 'ACC';
export const MODULE_ORG_DASH = 'ORG_DASH';
export const MODULE_ORG_SEARCH = 'ORG_SEARCH';
export const MODULE_EO_FILE = 'EO_FILE';
export const MODULE_COLLECTION_DASH = 'COLLECTION_DASH';
export const MODULE_EXPENSE_MANAGE = 'REPORT_EXP';
export const MODULE_REPORT_CUST_STAT = 'REPORT_CUST_STAT';
export const MODULE_ACCURATE = 'ACCURATE';
export const MODULE_TASK_MGR = 'TASK_MGR';
export const MODULE_OVD = 'OVD';
export const MODULE_DASHBOARD = 'DASHBOARD';
export const MODULE_PROFIT_SHARE = 'APFR';
export const MODULE_BOOKINGSHIPMENT = 'ABKG';
export const MODULE_WAREHOUSE = 'ALOT';
export const MODULE_IMC = 'IMC';
export const MODULE_AIR_GRAPH = 'ABKG';
export const PAYMENT_PROCESSING = 'APPS';
export const MODULE_AWB = 'AWB';
export const MODULE_ORG_CONTACT_MAINTEINANCE = 'ORG_CONT';
export const MODULE_SUB_ARN = 'SUB_ARN';
export const MODULE_PAYROLL_UPLOAD = 'ACCOUNT_FINANCE_UPLOAD_PAYROLL';

export const AIR_BOOKING_SHIPMENT = 'ABKG';
export const AIR_WAREHOUSE = 'ALOT';
export const AIR_PROFITSHARE = 'APFR';

export const IMPORT_LOT_SHORT = 'IO';
export const EXPORT_LOT_SHORT = 'EO';
export const IMPORT_LOT_LONG = 'Import Lot';
export const EXPORT_LOT_LONG = 'Export Lot';
export const IMPORT_OCEAN = 'Import Ocean';
export const IO = 'IO';
export const EO = 'EO';
export const IMPORT = 'Import';
export const EXPORT = 'Export';
export const AIR_EXPORT = 'Air Export';
export const AIR_FREIGHT = 'AF';

export const RECEIVED = 'Received';
export const LOT_TERMINATED = 'Terminated';
export const HOLD = 'Hold for';
export const IN_TRANSIT_TO_FINAL_CFS = 'In Transit to Final CFS';
export const IN_TRANSIT = 'In Transit';
export const DELIVERED = 'Delivered';
export const FINAL = 'Final';
export const NOTRECEIVED = 'Not Received';
export const BOOKED_NOT_RECEIVED = 'Booked But Not Received';

export const CREDIT_OVER = 'BOL_CONTINUE_SCREEN_REQUIRED';
export const CREDIT_HOLD = 'BOL_OVERRIDE_PASSWORD_REQUIRED';
export const ON_HOLD = 'undefined';
export const BL_CREDIT_HOLD = 'BOL_OVERRIDE_PASSWORD_REQUIRED';
export const BL_CREDIT_OVERRIDE = 'BOL_CONTINUE_SCREEN_REQUIRED';
export const ARN_CREDIT_OVERRIDE = 'ARN_OVERRIDE_PASSWORD_REQUIRED';

export const SYSTEM_VAT = 'S';
export const MANUAL_VAT = 'M';
export const VAT_DESCRIPTION_SEPARATER = ' @ ';
export const VAT_PERCENT_SYMBOL = '%';
export const VAT_CHARGE_CODE = 'VAT';

export const ROE_SYSTEM = 'S';
export const ROE_UPDATED = 'U';
export const ROE_FILESETUP = 'F';

export const COPY_BOL = 'COPYBOL';
export const POPULATE_BOL = 'POPULATEBOL';
export const RELAY_FLAG_ACCURATE = 'A';
export const RELAY_FLAG_GRDB = 'G';
export const RELAY_FLAG_MANUAL = 'U';
export const RELAY_FLAG_CTC = 'C';
export const RELAY_FLAG_TARRIF = 'T';
export const RELAY_FLAG_IMPORT = 'I';
export const RELAY_FLAG_TRK = 'D';
export const RELAY_FLAG_USER = 'U';
export const RELAY_FLAG_BOOKING = 'B';
export const TELEX_RELEASE = 'T';

export const LOGIN_CLIENT = 'loginClientBean';
export const NORMAL_SETTING = 'N';
export const ADMIN_SETTING = 'A';
export const MISC_SETTING = 'M';
export const OVERRIDE_PASSWORD_SETTING_CODE = 'OVERRIDE_PASSWORD';
export const DEBUG_MODE_SETTING_CODE = 'DEBUG_MODE';
export const LETTER_HEAD_SETTING_CODE = 'USER_DEFAULT_LETTERHEAD';
export const SECURITY_LEVEL_SETTING_CODE = 'USER_SECURITY_LEVEL';
export const USER_OFFICE_SETTING_CODE = 'USER_OFFICE';
export const USER_BI_ROLE_SETTING_CODE = 'USER_BI_ROLE';
export const USER_WAREHOUSE_SETTING_CODE = 'USER_DEFAULT_WAREHOUSE';
export const USER_PRINTER_SETTING_CODE = 'DEFAULT_PLAIN_PAPER_PRINTER';
export const USER_LETTERHEAD_SETTING_CODE = 'USER_DEFAULT_LETTERHEAD';
export const OVERRIDE_USERBI_ROLE_CODE = 'OVERRIDE_AGENTDB_USERBI_ROLE';
export const ADD_CHARGE_CATEGORY_ROLE = 'ADD_CHARGE_CATEGORY_ROLE';
export const ADD_EDIT_CHARGE_CODE_ROLE = 'ADD_EDIT_CHARGE_CODE_ROLE';
export const ADD_CHARGE_CODE_CATAGORY_ROLE = 'ADD_CHARGE_CODE_CATAGORY_ROLE';
export const OVERIDE_CHARGE_CODE_GL_ACCOUNT_ROLE = 'OVERIDE_CHARGE_CODE_GL_ACCOUNT_ROLE';
export const ADD_EDIT_TAX_CODE_ROLE = 'ADD_EDIT_TAX_CODE_ROLE';
export const DELETE_TAX_CODE_ROLE = 'DELETE_TAX_CODE_ROLE';
export const EXP_MANAGEMENT_ASST_ROLE_SETTING_CODE = 'EXPENSE_MANAGEMENT_ASST_ROLE';
export const TAX_PERCENTAGE_DECIMAL = 'TAX_PERCENTAGE_DECIMAL';

export const USERROLE_GLOBAL = 'GLOBAL_LEVEL';
export const USERROLE_NATIONAL = 'NATIONAL_LEVEL';
export const USERROLE_AIRPORT = 'AIRPORT_LEVEL';
export const USERROLE_OTHER = 'OTHER';

export const WEIGHTF_MULTIPLYING_FACTOR_METRIC = 0.45359237; // LBS → KG
export const LBS_TO_KG_FACTOR = 0.45359237;
export const KG_TO_LBS_FACTOR = 2.20462262;
export const CUBEF_MULTIPLYING_FACTOR = 35.3147248;
export const CBM_TO_CBF_FACTOR = 35.3147248;
export const CBF_TO_CBM_FACTOR = 0.0283168;
export const DEFAULT_UOM = 'M';

export const GLOBAL_PRECESION = 3;
export const WEBSERVICE_REQUEST_TIMEOUT = 300000; // ms
export const NUMBER_OF_NEWS_PER_PAGE = 15;
export const NUMBER_OF_SHIPPING_GLOSSARY_PER_PAGE = 20;
export const NUMBER_OF_TRACKING_RECORDS = 15;
export const ADVANCE_TRACKING_PAGINATION_RECORDS = 30;
export const ADVANCE_SEARCH_PAGE_PAGINATION_LABEL = 10;
export const ORGANIZATION_SEARCH_ITEM_PER_PAGE = 100;
export const ARNWAREHOUSE_MAXLENGTH = 100;
export const ARNWAREHOUSE_CHAR_PER_LINE = 40;
export const FILTER_LENGTH = 10;

export const PRELOADED_SUGGEST_BOX = 1;
export const AUTO_RPC_SUGGEST_BOX = 2;
export const PRELOADED_WITH_CUSTOME_ORACLE = 3;
export const AUTO_RPC_SUGGEST_BOX_HEADER_ON = 4;

export const DROPDOWN = 'DROPDOWN';
export const SUGGESTIONBOX = 'SUGGESTIONBOX';
export const TEXTBOX = 'TEXTBOX';
export const PASSWORDTEXTBOX = 'PASSWORDTEXTBOX';
export const NUMBERTEXTBOX = 'NUMBERTEXTBOX';

export const ADD = 'Add';
export const CANCEL = 'Cancel';
export const SUCCESS = 'SUCCESS';
export const SAVE = 'Save';
export const CLEARALL = 'ClearAll';
export const RELOAD = 'Reload';
export const DEFAULT = 'DEFAULT';
export const UPLOAD = 'UPLOAD';
export const DOWNLOAD = 'DOWNLOAD';
export const SN = 'SN';

export const EMAIL_SEPARATOR: string[] = [',', ' ', ':'];
export const COMMON_AUTO_NOTIFY = 'COMMON_AUTO_NOTIFY';
export const DEFAULT_FROM_EMAILID = 'config.mail.defaultFrom';

export const PROGRAM_CODE_PAGINATION = 'PGN';
export const PROGRAM_KEY_NUMBER_OF_ROWS_PER_PAGE = 'NUMBER_OF_ROWS_PER_PAGE';
export const PROGRAM_KEY_NUMBER_OF_PAGES_PER_TIME = 'NUMBER_OF_PAGES_PER_TIME';
export const BKG_REPORT = 'BKG_REPORT';
export const BKG_CLASSIFICATION_REPORT = 'BKG_CLASSIFICATION_REPORT';
export const WI_REPORT = 'WI_REPORT';
export const WIR_REPORT = 'WIR_REPORT';
export const AWI_REPORT = 'AWI_REPORT';
export const WAREHOUSE_INVENTORY_REPORT = 'Warehouse Inventory Report';
export const WAREHOUSE_MANAGEMENT = 'Warehouse Management';
export const CUSTOMER_STATEMENTS = 'CUSTOMER_STATEMENTS';

export const ACCURATE = 'ACCURATE';
export const ACCURATE_TARIFF = 'ACCURATE_TARIFF';
export const TRUCKRATE_TARIFF = 'TRUCKRATE_TARIFF';

export const AIR_DOCUMENT_ORDER = 'AIR_DOCUMENT_ORDER';
export const MAX_FRACTION_DIGITS = 'MAX_FRACTION_DIGITS';
export const AIR_TWO_DECIMAL_CHARGE_CODE = 'AIR_TWO_DECIMAL_CHARGE_CODE';
export const PROFIT_SHARE_CHARGE_CODE = 'PRO';
export const FCL_BOOKING_SCAC_CODE = 'SHPT';

export const EMT_STATUS_PARAM = 'emtImtStatus';
export const SEARCH_ACCOUNT_MODULE = 'ACCINV';
export const ARN_FINAL_CFS_ETA_MANDATORY = 'ARN_FINAL_CFS_ETA_MANDATORY';
export const PROCESS_FILE = 'processFile';
export const CUSTOMIZED_FILTER_NAME = '...';
export const TOGGEL_CUSTOMER_COOKIE = 'CUSTOMER';
export const NAME_OF_SESSION_COOKIE = 'JSESSIONID';
export const GLDATE = 'G';
export const INVOICEDATE = 'I';
export const RUN_OPTION_UPDATE = 'U';
export const LISTBOX_VALUE_LIMITED_QUANTITY = 'L';
export const PLEASE_SELECT_ORIGIN_BL = '1';
export const NEW_LINE_N = '\n';
export const NEW_LINE_R = '\r';
export const COLLECTION_DASHBOARD_ITEM_PER_PAGE = 'COLLECTION_DASHBOARD_ITEM_PER_PAGE';
export const COLLECTION_DASHBOARD_PAGE_PAGINATION_LABEL = 'COLLECTION_DASHBOARD_PAGE_PAGINATION_LABEL';

export const locationColumnWidth: string[] = ['60', '120', '60', '120'];
export const locationColumnName: string[] = ['Code', 'Name', 'UnCode', 'Country'];
export const locColumnWidth: string[] = ['60', '120', '60'];
export const locColumnName: string[] = ['Code', 'Name', 'UnCode'];

export const customerColumnWidth: string[] = ['90', '90', '220', '50', '90', '90', '60', '60', '0'];
export const customerColumnName: string[] = ['Code', 'Bill to Code', 'Name', 'Type', 'Alias', 'City', 'State', 'Country', ''];

export const customerWithStatusColumnWidth: string[] = ['90', '90', '220', '30', '90', '130', '60', '60', '60'];
export const customerWithStatusColumnName: string[] = ['Code', 'Bill to Code', 'Name', 'Type', 'Alias', 'City', 'State', 'Country', 'Status'];

export const HANDLING_DOCUMENT_TYPE_FORMAT_NAMES: string[] = ['Code', 'Name'];
export const HANDLING_DOCUMENT_TYPE_WIDTH: string[] = ['150', '200'];
export const HANDLING_OFFICE_FORMAT_NAMES: string[] = ['Code', 'Name'];
export const HANDLING_OFFICE_COLUMNS_WIDTH: string[] = ['90', '160'];

export const EMPLOYEE_NAME_SUGGESTIONS_COLUMN_NAMES: string[] = ['Name', 'Username'];
export const EMPLOYEE_NAME_SUGGESTIONS_COLUMN_WIDTHS: string[] = ['300', '200'];
export const PHOENIX_CONSTANT = "P";
export const PHOENIX_STRING = "Phoenix";
export const ESERVICE_CONSTANT = "A";
export const ESERVICE_STRING = "E-Service";
export const ESERVICE_STI_ONLINE_CONSTANT = "I";
export const STI_CONSTANT = "S";
export const SSCOFFICElIST: string[] = ["ANT", "ROT", "ROH", "LEH", "LYO", "PAR", "MAR", "AUH", "DXB"];
export const SSCONLINEBOOKING = "SSC Online"
export const STI_STRING = "STI Online";
export const EDI_CONSTANT = "E";
export const EDIBOOKING = "EDI";
export const GLOBALEXPORTBOOKING = "G";
export const GLOBAL_EXPORT_BOOKING = "GlobeAssist EX";

export const ORIGIN_CODE = "ORG";

export const TYPE_LCL = 'L';
export const TYPE_FCL = 'F';