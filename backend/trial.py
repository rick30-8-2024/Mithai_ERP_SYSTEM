data = open(r'D:\Programming\Projects\shlok\Mithai_ERP_SYSTEM\backend\database\import_inventory_data_copy.sql', 'r').read()
list_data = data.split('\n')
for i in list_data:
    if i.startswith('VALUES'):
        l = i.split(',')
        item_name = l[0].replace('VALUES (','').replace("'",'').strip()
        brand_name = l[7].replace("'",'').strip()
        sku = brand_name + '-' + item_name
        sku = sku.replace(' ','').upper()

        l[1] = "'" + sku + "'"
        new_line = ','.join(l)
        print(new_line)

        list_data[list_data.index(i)] = new_line

new_data = '\n'.join(list_data)
with open(r'D:\Programming\Projects\shlok\Mithai_ERP_SYSTEM\backend\database\import_inventory_data_copy.sql', 'w') as f:
    f.write(new_data)