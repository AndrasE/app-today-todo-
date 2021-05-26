db.products.updateOne({_id: 2}, {$set: {
    reviews: [{
        authorName: "Aby",
        reting: 4,
        review: "Noy too bad!"
      },
      {
        authorName: "Noel",
        rating: 3,
        review: "Ok!"
      }
    ]
  }
})
