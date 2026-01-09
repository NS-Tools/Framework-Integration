import { CustomerBase } from '../Framework/DataAccess/BaseRecords/CustomerBase';
import { FieldType } from '../Framework/DataAccess/FieldType';
import { NetsuiteRecord } from '../Framework/DataAccess/Record';

export class TestType extends NetsuiteRecord {
	static override recordType() {
		return 'customrecord_nst_test_type';
	}

	@FieldType.freeformtext
	name: string;

	@FieldType.checkbox
	custrecord_nst_test_type_checkbox: boolean;

	@FieldType.currency
	custrecord_nst_test_type_currency: number;

	@FieldType.integernumber
	custrecord_nst_test_type_customer_select: number;

	@FieldType.multiselect
	custrecord_nst_test_type_customer_multi: number[];

	@FieldType.date
	custrecord_nst_test_type_date: Date;

	@FieldType.datetime
	custrecord_nst_test_type_datetime: Date;

	@FieldType.freeformtext
	custrecord_nst_test_type_freeform_text: string;

	@FieldType.decimalnumber
	custrecord_nst_test_type_decimal: number;

	@FieldType.integernumber
	custrecord_nst_test_type_integer: number;

	@FieldType.percent
	custrecord_nst_test_type_percent: number;

	@FieldType.freeformtext
	custrecord_nst_test_type_phone: string;

	@FieldType.email
	custrecord_nst_test_type_email: string;
}
