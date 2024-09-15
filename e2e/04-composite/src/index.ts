import { defineBookFactory, dynamic } from './__generated__/fabbrica.js';

export const BookFactory = defineBookFactory({
  defaultFields: {
    __typename: 'Book',
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: 'Yuyushiki',
  },
});
