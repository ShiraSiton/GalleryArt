import artWorksModel from '../models/artWorks.js';

function validateArtWorkInput(data, { isUpdate = false } = {}) {
  const errors = [];

  // בדיקת כותרת
  if ('title' in data) {
    if (typeof data.title !== 'string' || data.title.trim().length < 1) {
      errors.push('הכותרת אינה תקינה');
    }
  } else if (!isUpdate) {
    errors.push('שדה כותרת חסר');
  }

  // בדיקת נתיב תמונה
  if ('imagePath' in data) {
    if (typeof data.imagePath !== 'string' || data.imagePath.trim() === '') {
      errors.push('נתיב תמונה אינו תקין');
    }
  } else if (!isUpdate) {
    errors.push('שדה נתיב תמונה חסר');
  }

  // אימייל הפך לאופציונלי – נבדוק אותו רק אם קיים
  
  return {
    valid: errors.length === 0,
    errors,
  };
}


const artWorksController = {
add: async (req, res) => {
     const { title } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: "יש לצרף קובץ תמונה" });
  }
     const email = req.user.email; 
  const imagePath = imageFile.filename; // שם הקובץ בלבד

  const result = validateArtWorkInput({ title,imagePath });
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }

  const newArt = { title, imagePath,email};

  try {
    const insertResult = await artWorksModel.add(newArt);
    newArt.id = insertResult.insertId; //אנחנו מחזירות את המזהה של היצירה החדשה שנוצרה אם נרצה לעשות עם זה דברים בהמשך
    res.status(201).json({
      message: 'היצירה נוספה בהצלחה',
      art: newArt,
    });
    
  } catch (err) {
    console.error('❌ שגיאה בהוספת יצירה:', err);
    res.status(500).json({ error: 'שגיאה בשרת בעת הוספת יצירה' });
  }
},
 getByEmail: async (req, res) => {
    const email = req.query.email; // מגיע מהפרונט ?email=...

    if (!email) {
      return res.status(400).json({ error: 'חסר פרמטר email' });
    }

    try {
      const arts = await artWorksModel.getByEmail(email);

      if (!arts || arts.length === 0) {
        return res.status(404).json({ error: 'לא נמצאו יצירות לאימייל הזה' });
      }

      res.json(arts);
    } catch (err) {
      console.error('❌ שגיאה בקבלת יצירות לפי אימייל:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
    }
  },


getAll: async (req, res) => {
  try {
    const arts = await artWorksModel.getAll();

    // התאמה למבנה שהפרונט מצפה אליו  כעת זה מערך אובייקטים פשוט עם שינוי שיש בו אובייקט מוכל
    const formatted = arts.map(a => ({
      id: a.id,
      title: a.title,
      likes: a.likes,
      imagePath: a.imagePath,
      email: a.email,
      artist: {
        name: a.artistName,
        profilePic: a.artistProfilePic
      }
    }));

    res.json(formatted);//ממירים את מערך האוביקטיים לגייסון
  } catch (err) {
    console.error("❌ שגיאה בקבלת כל היצירות:", err);
    res.status(500).json({ error: "שגיאה בשרת בעת שליפת יצירות" });
  }
}
,
  update: async (req, res) => {
    const id = req.params.id; 
    if (!id) {
      return res.status(400).json({ error: 'חסר מזהה יצירה לעדכון' });
    }

    const result = validateArtWorkInput(req.body, { isUpdate: true });
    if (!result.valid) {
      return res.status(400).json({ errors: result.errors });
    }

    const fieldsToUpdate = Object.fromEntries(
      Object.entries(req.body).filter(([_, val]) => val !== undefined && val !== null)
    );

    try {
      const updateResult = await artWorksModel.update(id, fieldsToUpdate);
      if (!updateResult || updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'יצירה לא נמצאה' });
      }

      res.json({ message: 'היצירה עודכנה בהצלחה' });
    } catch (err) {
      console.error('❌ שגיאה בעדכון יצירה:', err);
      res.status(500).json({ error: 'שגיאה בשרת בעת עדכון' });
    }
  },

  delete: async (req, res) => {
    const id = req.params.id;

    try {
      const result = await artWorksModel.delete(id);
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ error: 'היצירה לא נמצאה' });
      }

      res.json({ message: 'היצירה נמחקה בהצלחה' });
    } catch (error) {
      console.error('❌ שגיאה במחיקת יצירה:', error);
      res.status(500).json({ error: 'שגיאה בשרת בעת מחיקה' });
    }
  },
};

export default artWorksController;
