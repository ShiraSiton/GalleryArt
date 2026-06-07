import DB from '../DB/runSql.js'
const queryAsync= async (sql,params) =>{
    try{
        const[rows, fields]=await DB.execute(sql,params);
        return rows;
    }
    catch(err)
    {
        throw err
    }
}
const artWorksModel ={
   
  getAll: async () => {
  return await queryAsync(`
    SELECT 
      ArtWorks.id,
      ArtWorks.title,
      ArtWorks.likes,
      ArtWorks.imagePath,
      ArtWorks.email,
      Users.fullName AS artistName,
      Users.profilePic AS artistProfilePic
    FROM ArtWorks
    JOIN Users ON ArtWorks.email = Users.email
  `);
},
 getByEmail: async (email) => {
    return await queryAsync(
      `SELECT * FROM ArtWorks WHERE email = ?`,
      [email]
    );
  },
    add: async(artWorksTS) => {
        try{
           
                  
                Object.keys(artWorksTS).forEach(key => {//כלומר אם יש לי תכונה שלא הוגדרה נציב שם נאל
                 if (artWorksTS[key] === undefined) {
                   artWorksTS[key] = null;
                  }
                });

           const{title,imagePath,email}=artWorksTS
           const[result]= await DB.execute(

            
            `INSERT INTO ArtWorks 
            (title,imagePath,email)
            VALUES(?,?,?)`,
            [title,imagePath,email]
           );
           return result;// לא בטוח שבפועל משתמשים בנתון שחוזר פה אבל אנחנו מחזירות בכל מקרה ומי שירצה ישתמש בזה ומי שלא לא
        }
        catch(error)
        {
            console.error("שגיאה ב- ADD: ",error);
            throw error
        }
    },
    update:async(id,updateFiles) =>{
        const fields =[];
        const values=[];
        for(const [key,value] of Object.entries(updateFiles))
        {
            fields.push(`${key}=?`);
            values.push(value);
        }
        if(fields.length==0)
        {
            throw new Error("no fields provided to update");
        }
        const sql=`update artWorks set ${fields.join(',')} where id=?`
        values.push(id)
        return await queryAsync(sql, values)
    },
      delete: async (id) => {
        try {
            const result = await DB.execute(
                `DELETE FROM ArtWorks WHERE id = ?`,
                [id]
            );
            return result;
        } catch (error) {
            console.error("❌ שגיאה ב-delete:", error);
            throw error;
        }
    },
};
export default artWorksModel