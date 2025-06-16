// middleware/advancedResults.js
const advancedResults = (model, populate) => async (req, res, next) => {
  // URL'den sorgu parametrelerini al
  const reqQuery = { ...req.query };

  // Özel alanları çıkar (sayfalama, sıralama, seçim, arama vb.)
  // NOT: Arama (search) artık özel olarak ele alınacak
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

  // Aramayı kaydet
  const searchTerm = reqQuery.search;

  // Özel alanları kaldır
  removeFields.forEach(param => delete reqQuery[param]);

  // Gelişmiş filtreleme için sorguyu hazırla (gte, gt, lte, lt, in vb.)
  // Bu, arama terimi çıkarıldıktan sonra kalan alanlar içindir
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let filter = JSON.parse(queryStr);

  // Arama terimi varsa, filtrelere ekle
  if (searchTerm) {
    const searchRegex = { $regex: searchTerm, $options: 'i' };
    filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { sku: searchRegex }
    ];
}
 // Temel sorguyu oluştur (filtre objesini kullan)
  let query = model.find(filter);


  // Select (belirli alanları seçme)
  if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
  }

  // Sort (sıralama)
  if (req.query.sort) {
      // Frontend'den gelen format: field1,-field2 (desc için başa - ekle)
      // Frontend'den gelen format: field1,order (asc/desc)
      // bookSlice'ta sortOrder kullanıldığı için: field1,desc veya field1,asc bekleniyor
      const [sortByField, sortOrder] = req.query.sort.split(',');
       if (sortByField) {
           let sortBy = sortByField;
           if (sortOrder === 'desc') {
               sortBy = `-${sortByField}`;
           }
           query = query.sort(sortBy);
       }

  } else {
      query = query.sort('-createdAt'); // Varsayılan olarak oluşturma tarihine göre azalan sırala
  }

  // Sayfalama
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Toplam belge sayısını hesapla (Arama ve diğer filtreleri DAHİL ET)
  const total = await model.countDocuments(filter); // <-- BURASI ÖNEMLİ! Filtre objesini kullan

  query = query.skip(startIndex).limit(limit);

  // Populate (ilişkili verileri çekme)
  if (populate) {
      query = query.populate(populate);
  }

  // Sorguyu çalıştır
  const results = await query;

  // Sayfalama bilgisini hazırla
  const pagination = {};

  if (endIndex < total) {
      pagination.next = {
          page: page + 1,
          limit
      };
  }

  if (startIndex > 0) {
      pagination.prev = {
          page: page - 1,
          limit
      };
  }

  // Sonuçları middleware üzerinden ilgili route handler'a gönder
  // Toplam belge sayısını da ekle
  res.advancedResults = {
      success: true,
      count: results.length, // Mevcut sayfadaki sonuç sayısı
      total: total,          // <-- TOPLAM belge sayısı eklendi
      pagination,
      data: results
  };

  next();
};

module.exports = advancedResults;