import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { Form, Button, Row, Col, Toast, ToastContainer, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import axios from 'axios';

// Currency symbol map
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  // Add more currencies as needed
};

const FinancingRequestForm = () => {
  const [countries, setCountries] = useState([]);
  const [opecCountries, setOpecCountries] = useState([
    "Saudi Arabia", "Iran", "Iraq", "Kuwait", "United Arab Emirates", "Venezuela",
    "Nigeria", "Algeria", "Libya", "Angola", "Ecuador", "Gabon", "Equatorial Guinea", 
    "Congo", "Indonesia"
  ]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastVariant, setToastVariant] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader state

  useEffect(() => {
    // Fetch countries list using an API
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => setCountries(response.data.map(country => country.name.common)))
      .catch(err => console.error('Error fetching countries:', err));
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      surname: '',
      country: '',
      projectCode: '',
      description: '',
      amount: '',
      currency: 'USD', // Set the initial value of the currency to USD
      startDate: '',
      endDate: '',
    },
    validate: (values) => {
      const errors = {};

      // Project Code Validation
      const projectCodeRegex = /^[A-Z]{4}-[1-9]{4}$/;
      if (!values.projectCode) {
        errors.projectCode = 'Project code is required.';
      } else if (!projectCodeRegex.test(values.projectCode)) {
        errors.projectCode = 'Project Code should be in the format XXXX-XXXX (e.g., ABCD-1234)';
      }

      // Date Validation
      const today = new Date();
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      const minStartDate = new Date(today.setDate(today.getDate() + 15)); // 15 days ahead
      if (!values.startDate) {
        errors.startDate = 'Start date is required.';
      } else if (startDate < minStartDate) {
        errors.startDate = 'Start date must be at least 15 days from today.';
      }

      // End date should be at least 1 year after start date, and no more than 3 years
      if (!values.endDate) {
        errors.endDate = 'End date is required.';
      } else {
        // Calculate the minimum and maximum allowed end date
        const minEndDate = new Date(startDate);
        minEndDate.setFullYear(startDate.getFullYear() + 1); // 1 year after start date
        const maxEndDate = new Date(startDate);
        maxEndDate.setFullYear(startDate.getFullYear() + 3); // 3 years after start date

        if (endDate <= startDate) {
          errors.endDate = 'End date must be after the start date.';
        } else if (endDate < minEndDate) {
          errors.endDate = 'End date must be at least one year after the start date.';
        } else if (endDate > maxEndDate) {
          errors.endDate = 'End date must be no more than three years from the start date.';
        }
      }

      // Other required fields
      if (!values.name) {
        errors.name = 'First Name is required.';
      }

      if (!values.surname) {
        errors.surname = 'Last Name is required.';
      }

      if (!values.country) {
        errors.country = 'Country is required.';
      }

      if (!values.description) {
        errors.description = 'Description is required.';
      }

      if (!values.amount) {
        errors.amount = 'Amount is required.';
      }

      if (!values.currency) {
        errors.currency = 'Currency is required.';
      }

      return errors;
    },
    onSubmit: (values) => {
      setIsSubmitting(true); // Start loading
      // API call
      axios.post('/api/requests', values)
        .then((response) => {
          setToastMessage('Financing Request submitted successfully!');
          setToastVariant('success');
          setShowToast(true);
        })
        .catch((error) => {
          setToastMessage('Failed to submit request. Please try again.');
          setToastVariant('danger');
          setShowToast(true);
        })
        .finally(() => {
          setIsSubmitting(false); // Stop loading
        });
    },
  });

  useEffect(() => {
    if (formik.values.country && opecCountries.includes(formik.values.country)) {
      formik.setFieldValue('currency', 'USD');
    } 
    // else {
    //   formik.setFieldValue('currency', ''); // Let user select currency in other cases
    // }
  }, [formik.values.country]);

  return (
    <div className="form-container">
      <ToastContainer position="top-end">
        <Toast show={showToast} onClose={() => setShowToast(false)} bg={toastVariant} delay={3000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Form noValidate onSubmit={formik.handleSubmit} className="financing-form">
        <Row className="mb-3">
          <Col>
          <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="First Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              isInvalid={formik.touched.name && formik.errors.name}
              required
            />
            <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
          </Col>
          <Col>
          <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="surname"
              placeholder="Last Name"
              value={formik.values.surname}
              onChange={formik.handleChange}
              isInvalid={formik.touched.surname && formik.errors.surname}
              required
            />
            <Form.Control.Feedback type="invalid">{formik.errors.surname}</Form.Control.Feedback>
          </Col>
        </Row>

        <Form.Group controlId="formCountry" className="mb-3">
          <Form.Label>Country</Form.Label>
          <Form.Control
            as="select"
            name="country"
            value={formik.values.country}
            onChange={formik.handleChange}
            isInvalid={formik.touched.country && formik.errors.country}
            required
          >
            <option value="">Select Country</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">{formik.errors.country}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formProjectCode" className="mb-3">
          <Form.Label>Project Code</Form.Label>
          <Form.Control
            type="text"
            name="projectCode"
            placeholder="Project Code (XXXX-XXXX)"
            value={formik.values.projectCode}
            onChange={formik.handleChange}
            isInvalid={formik.touched.projectCode && formik.errors.projectCode}
            required
          />
          <Form.Control.Feedback type="invalid">{formik.errors.projectCode}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formDescription" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            placeholder="Description (Max 150 characters)"
            value={formik.values.description}
            onChange={formik.handleChange}
            isInvalid={formik.touched.description && formik.errors.description}
            maxLength={150}
            required
          />
          <Form.Control.Feedback type="invalid">{formik.errors.description}</Form.Control.Feedback>
        </Form.Group>

        <Row className="mb-3">
          <Col>
            <Form.Label>Amount</Form.Label>
            <InputGroup>
              <InputGroup.Text>{currencySymbols[formik.values.currency]}</InputGroup.Text>
              <FormControl
                type="number"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                isInvalid={formik.touched.amount && formik.errors.amount}
                required
              />
            </InputGroup>
            <Form.Control.Feedback type="invalid">{formik.errors.amount}</Form.Control.Feedback>
          </Col>
          <Col>
            <Form.Label>Currency</Form.Label>
            <Form.Control
              as="select"
              name="currency"
              value={formik.values.currency} // Pre-select USD
              onChange={formik.handleChange}
              required
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="INR">INR</option>
            </Form.Control>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Control
              type="date"
              name="startDate"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              isInvalid={formik.touched.startDate && formik.errors.startDate}
              required
            />
            <Form.Control.Feedback type="invalid">{formik.errors.startDate}</Form.Control.Feedback>
          </Col>
          <Col>
            <Form.Control
              type="date"
              name="endDate"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              isInvalid={formik.touched.endDate && formik.errors.endDate}
              required
            />
            <Form.Control.Feedback type="invalid">{formik.errors.endDate}</Form.Control.Feedback>
          </Col>
        </Row>

        <Button
          type="submit"
          variant="primary"
          className="mt-3"
          block
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            'Submit Request'
          )}
        </Button>
      </Form>
    </div>
  );
};

export default FinancingRequestForm;
