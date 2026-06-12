import { Box } from '@mui/material';
import { AutoTextarea, PModal, PSingleValueSearchableField, PNumberField, PConfirmationModal, PTextField } from 'phoenix-react-lib';
import { PDatePicker } from 'phoenix-react-lib';

import styles from '../../../../styles/LCL/FCLTruckingDetails.module.css';
import searchIcon from '../../../../assets/images/search-icon.png';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import { FCLTruckingDetailsProps, FCLTruckerFormData } from '../../../../types/LCL/misc/TruckingDetails.types';
import { useEffect, useState } from 'react';



const truckingDetails = ({
    formData = {} as FCLTruckerFormData,
    onChange = () => { },
    onChargesChange = () => {},
    pickupCodeSuggestion,
    handlePickupCodeSelect,
    truckerCodeSuggestion,
    handleTruckerCodeSelect,
    timeSuggestion,
    handleTimeSelection,
    onAdd,
    onRemove,
    chargeDescriptionSuggestion,
    handleChargeDescriptionSelection,
    currencySuggestion,
    handleCurrencySelection,
    datePickerOnBlurHandler,
    datePickerKeyDownHandler,
    dateSelectionHandler,
    error,
    pickUpDateRef,
    timePickerOnBlurHandler,
    pickupTimeToRef,
    pickupTimeRef,
    chargeDescriptionRefs,
    handleOrganizationSearch,
    openSearch,
    toggleSearch,
    onFieldsChange = () => { },
    onRegisterFields = () => { },
}: FCLTruckingDetailsProps) => {
    const [fieldName, setFieldName] = useState("");
    const TRACKED_FIELDS: string[] = ["pickupDate", "pickupTime"];
    const [skipNextBlurValidation, setSkipNextBlurValidation] = useState(false);
    useEffect(() => {
        onRegisterFields?.(TRACKED_FIELDS);
    }, []);

    console.log(formData , "formData")

    useEffect(() => {
        onFieldsChange?.(formData);
    }, [formData]);
    return (
      <div className={styles.container}>
        <Box className={styles.pad4x8}>
          <Box className={styles.grid}>
            <Box className={styles.colSpan7}>
              <Box className={`${styles.colSpan7} ${styles.searchWrap}`}>
                <PSingleValueSearchableField
                  label="Pickup Cargo At Code"
                  id="booking_codeSuggestBox"
                  data={pickupCodeSuggestion?.data ?? []}
                  value={formData.pickupAtCargoCode}
                  onChange={(val) => {
                    onChange('pickupAtCargoCode', val);
                    pickupCodeSuggestion?.setQuery(val);
                  }}
                  displayFields={[
                    'code',
                    'billToCode',
                    'name',
                    'type',
                    'alias',
                    'city',
                    'state',
                    'country',
                  ]}
                  columnHeaders={[
                    'Code',
                    'BillToCode',
                    'Name',
                    'Type',
                    'Alias',
                    'City',
                    'State',
                    'Country',
                  ]}
                  onSelect={(val) => {
                    handlePickupCodeSelect(val);
                  }}
                  usePortal
                />
                <Box
                  className={styles.searchIconFCL}
                  onClick={() => {
                    setFieldName('pickupAtCargoCode');
                    toggleSearch();
                  }}
                >
                  <img
                    src={searchIcon}
                    alt="search"
                    className={styles.searchImg}
                  />
                </Box>
              </Box>
              <Box className={`${styles.colSpan7} ${styles.pt1}`}>
                <AutoTextarea
                  id="customerAddress"
                  label="Cargo Loading/Pick Up Location"
                  value={formData.pickupAtCargoDetails}
                  charPerLine={40}
                  totalLines={6}
                  onChange={(e) =>
                    onChange('pickupAtCargoDetails', e.target.value)
                  }
                  autoSize={false}
                  maxLength={152}
                  height={'106px'}
                />
              </Box>

                {/* Nayan Java Developer*/}

              <Box className={styles.contactInfoGrid}>
                <Box>
                  <PTextField
                    id="pickerContact"
                    label="Contact Name"
                    value={formData.pickerContact}
                    totalLines={1}
                    autoSize={false}
                    
                    onChange={(e) =>
                        onChange('pickerContact', e.target.value)

                    }
                  />
                </Box>

                <Box>
                  <PTextField
                    id="pickerPhone"
                    label="Phone Number"
                    value={formData.pickerPhone}
                    totalLines={1}
                    autoSize={false}
                    maxLength={10}
                    height={'10px'}
                    
                    onChange={(e) =>
                      onChange('pickerPhone', e.target.value)
                    }
                  />
                </Box>

                <Box className={styles.emailField}>
                  {/* <AutoTextarea
                    id="pickupEmail"
                    label="Email"
                    value={formData.pickupEmail}
                    totalLines={1}
                    autoSize={false}
                    maxLength={50}
                    height={'10px'}
                    onChange={(e) =>
                        onChange('pickupEmail', e.target.value)
      
                    }
                  /> */}

                  <PTextField fullWidth
                    label="Email"
                    id="pickupEmail"
                    value={formData.pickupEmail}
                    onChange={(e) =>
                      onChange('pickupEmail', e.target.value)
                    }
                    type="email"
                  />
                </Box>

                {/* Trucking Details - Trucking Section */}
              </Box>
            </Box>
            <Box className={styles.colSpan7}>
              <Box className={`${styles.colSpan7} ${styles.searchWrap}`}>
                <PSingleValueSearchableField
                  label="Trucker Code"
                  id="booking_codeSuggestBox"
                  onChange={(val) => {
                    onChange('truckerCode', val);
                    truckerCodeSuggestion?.setQuery(val);
                  }}
                  value={formData.truckerCode}
                  data={truckerCodeSuggestion?.data ?? []}
                  displayFields={[
                    'code',
                    'billToCode',
                    'name',
                    'type',
                    'alias',
                    'city',
                    'state',
                    'country',
                  ]}
                  columnHeaders={[
                    'Code',
                    'billToCode',
                    'name',
                    'type',
                    'alias',
                    'city',
                    'state',
                    'country',
                  ]}
                  onSelect={(val) => {
                    handleTruckerCodeSelect(val);
                  }}
                  usePortal
                />
                <Box
                  className={styles.searchIconFCL}
                  onClick={() => {
                    setFieldName('truckerCode');
                    toggleSearch();
                  }}
                >
                  <img
                    src={searchIcon}
                    alt="search"
                    className={styles.searchImg}
                  />
                </Box>
              </Box>
              <Box className={`${styles.colSpan7} ${styles.pt1}`}>
                <AutoTextarea
                  id="customerAddress"
                  label="Trucker Details"
                  value={formData.truckerCodeDetails}
                  charPerLine={40}
                  totalLines={6}
                  onChange={(e) =>
                    onChange('truckerCodeDetails', e.target.value)
                  }
                  autoSize={false}
                  maxLength={152}
                  height={'106px'}
                />
              </Box>

              {/* Trucking Details - Trucking Section Nayan Bawane Changes  */}
              {/* <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginTop: '2px',
                }}
              > */}

              <Box className={styles.contactInfoGrid}>
                <Box>
                  <PTextField
                    id="truckerContact"
                    label="Contact Name"
                    value={formData.truckerContact}
                    totalLines={1}
                    autoSize={false}
                    maxLength={50}
                    height={'10px'}
                    onChange={(e) =>
                      onChange('truckerContact', e.target.value)
                    }
                  />
                </Box>

                <Box>
                  <PNumberField
                    id="truckerPhone"
                    label="Phone Number"
                    value={formData.truckerPhone}
                    totalLines={1}
                    autoSize={false}
                    maxLength={10}
                    height={'10px'}
                    onChange={(e) =>
                      onChange('truckerPhone', e.target.value)
                    }
                  />
                </Box>

                {/* <Box className={styles.emailField}>
                  <AutoTextarea
                    id="truckerEmail"
                    label="Email"
                    value={formData.truckerEmail}
                    totalLines={1}
                    autoSize={false}
                    maxLength={50}
                    height={'10px'}
                    onChange={(e) => onChange('truckerEmail', e.target.value)}
                  />
                </Box> */}


                <Box className={styles.emailField}>
                <PTextField
                    fullWidth
                    id="truckerEmail"
                    label="Email"
                    value={formData.truckerEmail}
                    type="email"
                    onChange={(e) =>
                      onChange('truckerEmail', e.target.value)
                    }
                />
                </Box>
              </Box>
            </Box>
            <Box className={styles.colSpan7}>
              <AutoTextarea
                id="customerAddress"
                label="Pickup Instructions"
                value={formData.pickupInstruction}
                onChange={(e) => onChange('pickupInstruction', e.target.value)}
                charPerLine={40}
                totalLines={7}
                autoSize={false}
                maxLength={152}
                height={'152px'}
              />
            </Box>

                    <Box className={styles.colSpan3}>
                        <Box className={styles.colSpan3}>
                            <PDatePicker
                                label="Pickup Date"
                                value={formData.pickupDate}
                                onChange={(val) =>{
                                    setSkipNextBlurValidation(true);
                                    onChange("pickupDate", (val ?? null) as never)
                                }}
                                onBlur={(event) => {
                                    datePickerOnBlurHandler(event as React.KeyboardEvent<HTMLInputElement>, "pickupDate");
                                }}
                                onkeydown={(event) => {
                                    datePickerKeyDownHandler(event as React.KeyboardEvent<HTMLInputElement>, "pickupDate");
                                }}
                                onDateSelection={(val: Date | null) => {
                                    dateSelectionHandler(val, "pickupDate");
                                }}
                                inputRef={pickUpDateRef}
                                skipNextBlurValidation={skipNextBlurValidation}
                            />
                        </Box>
                        <Box className={`${styles.colSpan8} ${styles.pt1}`}>
                            <Box className={styles.label}>
                                Pickup Time
                            </Box>
                            <Box className={`${styles.grid} ${styles.cg4}`}>
                                <Box className={`${styles.colSpan12} ${styles.pt1} ${styles.pickupTimeField}`}>
                                    <PSingleValueSearchableField
                                        placeholder="From"
                                        value={formData.pickupTime}
                                        onChange={(val) => {
                                            onChange('pickupTime', val);
                                            timeSuggestion?.setQuery(val);
                                        }}
                                        data={timeSuggestion?.data ?? []}
                                        displayFields={['time']}
                                        columnHeaders={[]}
                                        onSelect={(val) => {
                                            handleTimeSelection(val, 'pickupTime');
                                        }}
                                        onBlur={(val) => {
                                            val.preventDefault();
                                            val.stopPropagation();
                                            setTimeout(() => {
                                                timePickerOnBlurHandler(val, 'pickupTime');
                                            }, 200);
                                        }}
                                        inputRef={pickupTimeRef}
                                        usePortal
                                    />
                                </Box>
                                <Box className={`${styles.colSpan12} ${styles.pt1} ${styles.pickupTimeField}`}>
                                    <PSingleValueSearchableField
                                        placeholder="To"
                                        value={formData.pickupTimeTo}
                                        onChange={(val) => {
                                            onChange('pickupTimeTo', val);
                                            timeSuggestion?.setQuery(val);
                                        }}
                                        data={timeSuggestion?.data ?? []}
                                        displayFields={['time']}
                                        columnHeaders={[]}
                                        onSelect={(val) => {
                                            handleTimeSelection(val, 'pickupTimeTo');
                                        }}
                                        onBlur={(val) => {
                                            val.preventDefault();
                                            val.stopPropagation();
                                            setTimeout(()=>{
                                                timePickerOnBlurHandler(val,'pickupTimeTo');
                                            },200)
                                        }}
                                        inputRef={pickupTimeToRef}
                                        usePortal
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                {formData.charges.map((row,index) => (
                    <Box className={styles.rowgrid}>
                        <Box className={`${styles.colSpan6} ${styles.pt1}`}>
                            <PSingleValueSearchableField
                                inputRef={(el) => { chargeDescriptionRefs.current[index] = el; }}
                                label={index === 0 ? "Charge Description" : ""}
                                value={
                                    row?.charge && row?.chargeDescription
                                        ? `${row.charge} - ${row.chargeDescription}`
                                        : row?.charge || row?.chargeDescription || ''
                                    }
                                onChange={(value) => {
                                    onChargesChange("chargeDescription",value,index);
                                    chargeDescriptionSuggestion?.setQuery(value);
                                }}
                                data={chargeDescriptionSuggestion?.data?? []}
                                displayFields={['SUGGEST_KEY']}
                                columnHeaders={[]}
                                onSelect={(val) => {
                                    handleChargeDescriptionSelection(val, index);
                                }}
                                usePortal
                            />
                        </Box>
                        <Box className={`${styles.colSpan6} ${styles.pt1}`}>
                            <PSingleValueSearchableField
                                label={index === 0 ? "Currency" : ""}
                                value={row.currency ?? ""}//currency
                                onChange={(value) => {
                                    onChargesChange("currency",value,index);
                                    currencySuggestion?.setQuery(value);
                                }}
                                data={currencySuggestion?.data??[]}
                                displayFields={['SUGGEST_VALUE']}
                                columnHeaders={[]}
                                onSelect={(val) => {
                                    handleCurrencySelection(val, index);
                                }}
                                usePortal
                            />
                        </Box>
                        <Box className={`${styles.colSpan2} ${styles.pt2}`}>
                            <PNumberField
                                label={index === 0 ? "Income" : ""}
                                value={row.income}//income
                                onChange={(val) => {
                                    onChargesChange("income",val,index);
                                }}
                            />
                        </Box>
                        <Box className={`${styles.colSpan2} ${styles.pt2}`}>
                            <PNumberField
                                label={index === 0 ? "Expense" : ""}
                                value={row.expense}//expense
                                onChange={(val) => {
                                    onChargesChange("expense",val,index);
                                }}
                            />
                        </Box>
                        <Box className={`${styles.colSpan2}`}>
                            <Box className={styles.truckingButtonsContainer}>
                                <button className={styles.btn} onClick={() => { onAdd(index) }}>
                                    +
                                </button>
                                <button className={styles.btn} onClick={() => { onRemove(index) }}>
                                    −
                                </button>
                            </Box>
                        </Box>
                    </Box>
                ))}

          <hr className={`${styles.truckingDivider}`} />

          <Box className={styles.summaryGrid}>
            <Box className={styles.summaryCard}>
              <Box className={styles.label}>Total Income</Box>

              <hr className={styles.summaryDivider} />

              <Box className={styles.label}>{formData.totalIncome ?? 0}</Box>
            </Box>

            <Box className={styles.summaryCard}>
              <Box className={styles.label}>Total Expense</Box>

              <hr className={styles.summaryDivider} />

              <Box className={styles.label}>{formData.totalExpense ?? 0}</Box>
            </Box>

            <Box className={styles.summaryCard}>
              <Box className={styles.label}>Profit/Loss</Box>

              <hr className={styles.summaryDivider} />

                        <Box className={styles.label}>
                            {formData.profitOrLoss ?? 0}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <PConfirmationModal
                open={error?.showErrorModal ?? false}
                title='Error'
                variant='danger'
                buttonAlign="end"
                message={error?.message}
                secondaryAction={{
                    label: "Close",
                    onClick: () => {
                        error?.onClose();
                        setSkipNextBlurValidation(false);
                    }
                }} />

        <PModal
          title="Organization Search"
          open={openSearch}
          isCloseIcon
          onClose={() => toggleSearch()}
          height={{ xs: '85vh', md: '31rem' }}
          width={{ xs: '95vw', sm: '95vw', md: 1049 }}
          backgroundColor="white"
          contentSx={{ pl: 0 }}
        >
          <Box className={styles.orgSearchContent}>
            <POrganizationSearchPage
              onSelect={(val) => {
                handleOrganizationSearch(val, fieldName);
              }}
              moduleType={'QUO'}
            />
          </Box>
        </PModal>
      </div>
    );
}
export default truckingDetails;
