class APIFeature {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    const queryObjTemp = { ...this.queryObj };

    const excludedFields = ['limit', 'fields', 'page', 'sort'];
    excludedFields.forEach((el) => delete queryObjTemp[el]);

    let queryString = JSON.stringify(queryObjTemp);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' ');
      //   //console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ createdAt: -1 });
    }
    return this;
  }

  pagination() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // this.query = this.query.skip(skip).limit(limit);
    // if (this.queryObj.page) {
    //   const response = await this.query;
    //   const num = response.length * 1;
    //   //console.log(skip + ' ' + num);
    //   if (skip > num) throw new Error('This page does not exit');
    // }
    return this;
  }
}
module.exports = APIFeature;
