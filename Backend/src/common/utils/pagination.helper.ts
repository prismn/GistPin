export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    count: number;
    cursor: string | null;
    hasMore: boolean;
  };
}

export class PaginationHelper {
  /**
   * Encode a Date into a base64 cursor string.
   */
  static encodeCursor(date: Date): string {
    return Buffer.from(date.toISOString()).toString('base64');
  }

  /**
   * Decode a base64 cursor string back to an ISO date string.
   * Returns null if the cursor is invalid.
   */
  static decodeCursor(cursor: string): string | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      // Validate it parses as a date
      const date = new Date(decoded);
      if (isNaN(date.getTime())) return null;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Build a paginated response from a list of items.
   * The last item's created_at is used as the next cursor.
   */
  static buildResponse<T extends { created_at: Date }>(
    items: T[],
    limit: number,
  ): PaginatedResponse<T> {
    const hasMore = items.length === limit;
    const lastItem = items[items.length - 1];
    const cursor = hasMore && lastItem ? PaginationHelper.encodeCursor(lastItem.created_at) : null;

    return {
      data: items,
      pagination: {
        count: items.length,
        cursor,
        hasMore,
      },
    };
  }
}
