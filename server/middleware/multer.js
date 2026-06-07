import multer from 'multer';

// הגדרת תיקיית יעד ושם קובץ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // ודא שתיקיה זו קיימת
  },
  filename: function (req, file, cb) {
    // נשתמש ב-postId מה-params אם קיים, אחרת נ fallback ל-Date.now()
    const imgId = req.params?.postId || Date.now();
    // שמור את הסיומת המקורית של הקובץ
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
    cb(null, `${imgId}${ext}`);
  }
});
const upload  = multer({ storage: storage });
export default upload ;
