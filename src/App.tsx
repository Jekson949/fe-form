import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box, Button, Card, CardContent, Divider, IconButton,
  MenuItem, Stack, TextField, Typography
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

type Framework = 'angular' | 'react' | 'vue';

const versionsMap: Record<Framework, string[]> = {
  angular: ['1.1.1', '1.2.1', '1.3.3'],
  react: ['2.1.2', '3.2.4', '4.3.1'],
  vue: ['3.3.1', '5.2.1', '5.1.3'],
};

type Hobby = { name: string; duration: string };
type FormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  framework: Framework | '';
  frameworkVersion: string;
  email: string;
  hobbies: Hobby[];
};

export default function App() {
  const { control, handleSubmit, watch, resetField, formState: { errors, isSubmitting }, setError, clearErrors } =
    useForm<FormValues>({
      defaultValues: {
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        framework: '',
        frameworkVersion: '',
        email: '',
        hobbies: [{ name: '', duration: '' }],
      }
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'hobbies' });

  const framework = watch('framework');

  React.useEffect(() => {
    resetField('frameworkVersion', { defaultValue: '' });
  }, [framework, resetField]);

  React.useEffect(() => {
    if (fields.length < 1) {
      setError('hobbies', { type: 'min', message: 'At least one hobby is required' });
    } else {
      clearErrors('hobbies');
    }
  }, [fields.length, setError, clearErrors]);

  const validateEmailAsync = async (value: string) => {
    await new Promise(res => setTimeout(res, 500));
    if (value.trim().toLowerCase() === 'test@test.test') {
      return 'This email already exists';
    }
    return true;
  };

  const onSubmit = (data: FormValues) => {

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, 'dd-MM-yyyy') : '',
      framework: data.framework || '',
      frameworkVersion: data.frameworkVersion,
      email: data.email,
      hobbies: data.hobbies.map(h => ({ name: h.name, duration: h.duration })),
    };
    console.clear();
    console.log('Payload:', payload);
    setPreview(payload);
  };

  const [preview, setPreview] = React.useState<any>(null);

  const frameworkVersions = framework ? versionsMap[framework] : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 920, mx: 'auto', p: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" gutterBottom>Frontend Engineer Form</Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack direction="row" flexWrap="wrap" gap={2}>

                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField {...field} label="Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField {...field} label="Lastname" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                  )}
                />

                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Date of birth"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dateOfBirth,
                          helperText: errors.dateOfBirth?.message
                        }
                      }}
                    />
                  )}
                />

                <Controller
                  name="framework"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="FE technology"
                      fullWidth
                      error={!!errors.framework}
                      helperText={errors.framework?.message}
                    >
                      <MenuItem value="angular">angular</MenuItem>
                      <MenuItem value="react">react</MenuItem>
                      <MenuItem value="vue">vue</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="frameworkVersion"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="FE technology version"
                      fullWidth
                      disabled={!framework}
                      error={!!errors.frameworkVersion}
                      helperText={errors.frameworkVersion?.message}
                    >
                      {frameworkVersions.map(v => (
                        <MenuItem key={v} value={v}>{v}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    validate: validateEmailAsync
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6">Hobbies</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => append({ name: '', duration: '' })}>
                  Add hobby
                </Button>
              </Stack>

              <Stack gap={1}>
                {fields.map((field, index) => (
                  <Stack key={field.id} direction="row" gap={1} alignItems="center">
                    <Controller
                      name={`hobbies.${index}.name`}
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <TextField {...field} label="Name" fullWidth error={!!errors.hobbies?.[index]?.name}
                          helperText={errors.hobbies?.[index]?.name?.message as string || ''} />
                      )}
                    />
                    <Controller
                      name={`hobbies.${index}.duration`}
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <TextField {...field} label="Duration" placeholder="2 month" fullWidth
                          error={!!errors.hobbies?.[index]?.duration}
                          helperText={errors.hobbies?.[index]?.duration?.message as string || ''} />
                      )}
                    />
                    <IconButton color="error" onClick={() => remove(index)} aria-label="remove hobby">
                      <Delete />
                    </IconButton>
                  </Stack>
                ))}

                {!!errors.hobbies && typeof errors.hobbies?.message === 'string' && (
                  <Typography color="error" variant="caption">{errors.hobbies.message}</Typography>
                )}
              </Stack>

              <Stack direction="row" gap={1} mt={2}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>Submit</Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {preview && (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">Payload</Typography>
              <pre style={{ margin: 0 }}>{JSON.stringify(preview, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
}
