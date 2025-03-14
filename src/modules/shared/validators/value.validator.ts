export class DataFormatter {
  static formatValue(value: any): any {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      // Date
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
        return new Date(trimmedValue); // YYYY-MM-DD
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue)) {
        const [day, month, year] = trimmedValue.split('/').map(Number);
        return new Date(year, month - 1, day); // DD/MM/YYYY
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(trimmedValue)) {
        const [month, day, year] = trimmedValue.split('-').map(Number);
        return new Date(year, month - 1, day); // MM-DD-YYYY
      }

      // Boolean
      if (trimmedValue.toLowerCase() === 'true') return true;
      if (trimmedValue.toLowerCase() === 'false') return false;

      // Point
      if (!isNaN(Number(trimmedValue))) {
        return Number(trimmedValue);
      }

      // Phone number
      if (/^\+?\d[\d\s-]{8,}\d$/.test(trimmedValue)) {
        return trimmedValue.replace(/[-\s]/g, '');
      }

      return trimmedValue;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatValue(item));
    }

    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach((key) => {
        value[key] = this.formatValue(value[key]);
      });
      return value;
    }

    return null;
  }
}
