import { CustomerBase } from '../Framework/DataAccess/BaseRecords/CustomerBase';
import { FieldType } from '../Framework/DataAccess/FieldType';

export class CustomerWithAlias extends CustomerBase {
	@FieldType.alias('companyname')
	public my_alias: string;
}
