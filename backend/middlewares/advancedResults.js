// backend/middlewares/advancedResults.js
const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
  
    // URL'den sorgu parametrelerini al
    const reqQuery = { ...req.query };
  
    // Özel alanları (sayfalama, sıralama, seçim, arama vb.) sorgudan çıkar
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  
    // Arama terimini ve sıralama bilgisini kaydet
    const searchTerm = reqQuery.search;
    const sort = reqQuery.sort;
    
    // Özel alanları kaldır
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Gelişmiş filtreleme için sorguyu hazırla (gte, gt, lte, lt, in vb.)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    let filter = JSON.parse(queryStr);
  
    // Arama terimi varsa, arama yapılacak alanları belirle
    if (searchTerm) {
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      // Model'e göre arama yapılacak alanları dinamik olarak belirleyebilirsiniz
      // Örnek olarak title ve originalTitle alanları eklendi
      filter.$or = [
          { title: searchRegex },
          { originalTitle: searchRegex },
      ];
    }
  
    // Temel sorguyu oluştur
    query = model.find(filter);
  
    // Select (belirli alanları seçme)
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
  
    // Sort (sıralama)
    if (sort) {
        const sortBy = sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        // Varsayılan sıralama: popülerliğe göre azalan
        query = query.sort('-popularity'); 
    }
  
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; // Sayfa başına 20 film
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const total = await model.countDocuments(filter);
  
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
  
    res.advancedResults = {
        success: true,
        count: results.length,
        total,
        pagination,
        data: results
    };
  
    next();
  };
  
  module.exports = advancedResults;